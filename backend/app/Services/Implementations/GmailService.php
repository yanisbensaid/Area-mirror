<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GmailService extends BaseService
{
    protected string $name = 'Gmail';
    protected string $description = 'Email integration via Gmail API';
    protected string $authType = 'oauth2';
    protected ?string $icon = 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico';
    protected ?string $color = '#EA4335';

    private string $baseUrl = 'https://gmail.googleapis.com/gmail/v1';
    private ?string $accessToken = null;

    public function authenticate(array $credentials): bool
    {
        $this->accessToken = $credentials['access_token'] ?? null;

        if (empty($this->accessToken)) {
            return false;
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users/me/profile", []);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Gmail authentication failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function isAuthenticated(): bool
    {
        return !empty($this->accessToken);
    }

    protected function getHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    public function testConnection(): bool
    {
        return $this->authenticate(['access_token' => $this->accessToken]);
    }

    public function getAvailableActions(): array
    {
        return [
            'new_email_received' => [
                'name' => 'New Email Received',
                'description' => 'Triggers when a new email is received',
                'params' => [
                    'from' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Filter by sender email address'
                    ],
                    'subject_contains' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Filter by keyword in subject'
                    ]
                ]
            ],
            'email_with_attachment' => [
                'name' => 'Email with Attachment',
                'description' => 'Triggers when an email with attachment is received',
                'params' => []
            ],
            'email_from_sender' => [
                'name' => 'Email from Sender',
                'description' => 'Triggers when an email from specific sender is received',
                'params' => [
                    'sender_email' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Email address of the sender'
                    ]
                ]
            ],
        ];
    }

    public function getAvailableReactions(): array
    {
        return [
            'send_email' => [
                'name' => 'Send Email',
                'description' => 'Sends an email from your Gmail account',
                'params' => [
                    'to' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Recipient email address'
                    ],
                    'subject' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Email subject'
                    ],
                    'body' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Email body (HTML supported)'
                    ],
                    'cc' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'CC email address'
                    ],
                    'bcc' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'BCC email address'
                    ]
                ]
            ],
            'mark_as_read' => [
                'name' => 'Mark as Read',
                'description' => 'Marks an email as read',
                'params' => [
                    'message_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Gmail message ID'
                    ]
                ]
            ],
            'add_label' => [
                'name' => 'Add Label',
                'description' => 'Adds a label to an email',
                'params' => [
                    'message_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Gmail message ID'
                    ],
                    'label_name' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Label name (e.g., IMPORTANT, INBOX)'
                    ]
                ]
            ],
        ];
    }

    public function executeAction(string $actionName, array $params): mixed
    {
        return match($actionName) {
            'new_email_received' => $this->checkNewEmails($params),
            'email_with_attachment' => $this->checkEmailsWithAttachment($params),
            'email_from_sender' => $this->checkEmailsFromSender($params),
            default => throw new \InvalidArgumentException("Unknown action: $actionName")
        };
    }

    public function executeReaction(string $reactionName, array $params): bool
    {
        return match($reactionName) {
            'send_email' => $this->sendEmail($params),
            'mark_as_read' => $this->markAsRead($params),
            'add_label' => $this->addLabel($params),
            default => throw new \InvalidArgumentException("Unknown reaction: $reactionName")
        };
    }

    private function checkNewEmails(array $params): array
    {
        $lastMessageIds = $params['last_message_ids'] ?? [];
        $isFirstRun = empty($lastMessageIds);

        $query = 'is:unread';

        // Add optional filters
        if (!empty($params['from'])) {
            $query .= ' from:' . $params['from'];
        }

        if (!empty($params['subject_contains'])) {
            $query .= ' subject:' . $params['subject_contains'];
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users/me/messages", [
                'q' => $query,
                'maxResults' => 10,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $messages = $response->json()['messages'] ?? [];

            if (empty($messages)) {
                // No messages found, but still return current state
                return ['_current_state' => ['last_message_ids' => $lastMessageIds]];
            }

            $newEmails = [];
            $currentMessageIds = [];

            foreach ($messages as $message) {
                $messageId = $message['id'];
                $currentMessageIds[] = $messageId;

                // Skip if already seen
                if (in_array($messageId, $lastMessageIds)) {
                    continue;
                }

                // Get full message details
                $details = $this->getMessageDetails($messageId);

                if ($details) {
                    $newEmails[] = $details;
                }
            }

            // First run: don't trigger but save state
            if ($isFirstRun && !empty($currentMessageIds)) {
                Log::info('Gmail: First run - initializing with current messages', [
                    'message_count' => count($currentMessageIds)
                ]);
                return ['_current_state' => ['last_message_ids' => $currentMessageIds]];
            }

            // Update state even if no new emails
            if (empty($newEmails)) {
                return ['_current_state' => ['last_message_ids' => $currentMessageIds]];
            }

            // Add current state to each email result
            foreach ($newEmails as &$email) {
                $email['_current_state'] = ['last_message_ids' => $currentMessageIds];
            }

            return $newEmails;

        } catch (\Exception $e) {
            Log::error('Failed to check Gmail messages', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    private function checkEmailsWithAttachment(array $params): array
    {
        $lastMessageIds = $params['last_message_ids'] ?? [];
        $isFirstRun = empty($lastMessageIds);

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users/me/messages", [
                'q' => 'has:attachment is:unread',
                'maxResults' => 10,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $messages = $response->json()['messages'] ?? [];

            if (empty($messages)) {
                return [];
            }

            $newEmails = [];
            $currentMessageIds = [];

            foreach ($messages as $message) {
                $messageId = $message['id'];
                $currentMessageIds[] = $messageId;

                if (in_array($messageId, $lastMessageIds)) {
                    continue;
                }

                $details = $this->getMessageDetails($messageId);

                if ($details && $details['has_attachment']) {
                    $newEmails[] = $details;
                }
            }

            if ($isFirstRun && !empty($currentMessageIds)) {
                return ['_current_state' => ['last_message_ids' => $currentMessageIds]];
            }

            return $newEmails;

        } catch (\Exception $e) {
            Log::error('Failed to check emails with attachments', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    private function checkEmailsFromSender(array $params): array
    {
        $senderEmail = $params['sender_email'] ?? null;
        $lastMessageIds = $params['last_message_ids'] ?? [];
        $isFirstRun = empty($lastMessageIds);

        if (!$senderEmail) {
            return [];
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users/me/messages", [
                'q' => "from:{$senderEmail} is:unread",
                'maxResults' => 10,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $messages = $response->json()['messages'] ?? [];

            if (empty($messages)) {
                return [];
            }

            $newEmails = [];
            $currentMessageIds = [];

            foreach ($messages as $message) {
                $messageId = $message['id'];
                $currentMessageIds[] = $messageId;

                if (in_array($messageId, $lastMessageIds)) {
                    continue;
                }

                $details = $this->getMessageDetails($messageId);

                if ($details) {
                    $newEmails[] = $details;
                }
            }

            if ($isFirstRun && !empty($currentMessageIds)) {
                return ['_current_state' => ['last_message_ids' => $currentMessageIds]];
            }

            return $newEmails;

        } catch (\Exception $e) {
            Log::error('Failed to check emails from sender', [
                'sender' => $senderEmail,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    private function getMessageDetails(string $messageId): ?array
    {
        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users/me/messages/{$messageId}", [
                'format' => 'full'
            ]);

            if (!$response->successful()) {
                return null;
            }

            $message = $response->json();
            $headers = $message['payload']['headers'] ?? [];

            return [
                'message_id' => $message['id'],
                'thread_id' => $message['threadId'],
                'from' => $this->extractHeader($headers, 'From'),
                'to' => $this->extractHeader($headers, 'To'),
                'subject' => $this->extractHeader($headers, 'Subject'),
                'snippet' => $message['snippet'] ?? '',
                'received_at' => $this->extractHeader($headers, 'Date'),
                'has_attachment' => $this->hasAttachment($message['payload']),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get Gmail message details', [
                'message_id' => $messageId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    private function extractHeader(array $headers, string $name): ?string
    {
        foreach ($headers as $header) {
            if (strcasecmp($header['name'], $name) === 0) {
                return $header['value'];
            }
        }
        return null;
    }

    private function hasAttachment(array $payload): bool
    {
        if (isset($payload['parts'])) {
            foreach ($payload['parts'] as $part) {
                if (isset($part['filename']) && !empty($part['filename'])) {
                    return true;
                }
                if (isset($part['parts'])) {
                    if ($this->hasAttachment($part)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private function sendEmail(array $params): bool
    {
        $to = $params['to'] ?? null;
        $subject = $params['subject'] ?? '';
        $body = $params['body'] ?? '';

        if (!$to) {
            return false;
        }

        try {
            $encodedMessage = $this->encodeEmail([
                'to' => $to,
                'subject' => $subject,
                'body' => $body,
                'cc' => $params['cc'] ?? null,
                'bcc' => $params['bcc'] ?? null,
            ]);

            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/users/me/messages/send", [
                    'raw' => $encodedMessage
                ]);

            if ($response->successful()) {
                Log::info('Email sent successfully via Gmail', [
                    'to' => $to,
                    'subject' => $subject
                ]);
                return true;
            }

            Log::error('Failed to send Gmail email', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Failed to send Gmail email', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    private function encodeEmail(array $params): string
    {
        $to = $params['to'];
        $subject = $params['subject'];
        $body = $params['body'];
        $cc = $params['cc'] ?? null;
        $bcc = $params['bcc'] ?? null;

        $message = "To: {$to}\r\n";

        if ($cc) {
            $message .= "Cc: {$cc}\r\n";
        }

        if ($bcc) {
            $message .= "Bcc: {$bcc}\r\n";
        }

        $message .= "Subject: {$subject}\r\n";
        $message .= "Content-Type: text/html; charset=utf-8\r\n\r\n";
        $message .= $body;

        // Encode to base64url
        return rtrim(strtr(base64_encode($message), '+/', '-_'), '=');
    }

    private function markAsRead(array $params): bool
    {
        $messageId = $params['message_id'] ?? null;

        if (!$messageId) {
            return false;
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/users/me/messages/{$messageId}/modify", [
                    'removeLabelIds' => ['UNREAD']
                ]);

            if ($response->successful()) {
                Log::info('Gmail message marked as read', ['message_id' => $messageId]);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to mark Gmail message as read', [
                'message_id' => $messageId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    private function addLabel(array $params): bool
    {
        $messageId = $params['message_id'] ?? null;
        $labelName = $params['label_name'] ?? 'IMPORTANT';

        if (!$messageId) {
            return false;
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/users/me/messages/{$messageId}/modify", [
                    'addLabelIds' => [$labelName]
                ]);

            if ($response->successful()) {
                Log::info('Label added to Gmail message', [
                    'message_id' => $messageId,
                    'label' => $labelName
                ]);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to add label to Gmail message', [
                'message_id' => $messageId,
                'label' => $labelName,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
