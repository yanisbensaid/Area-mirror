<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $subject;
    public $title;
    public $message;
    public $actionText;
    public $actionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        User $user,
        string $subject,
        string $title,
        string $message,
        string $actionText = null,
        string $actionUrl = null
    ) {
        $this->user = $user;
        $this->subject = $subject;
        $this->title = $title;
        $this->message = $message;
        $this->actionText = $actionText;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'userName' => $this->user->name,
                'userEmail' => $this->user->email,
                'title' => $this->title,
                'message' => $this->message,
                'actionText' => $this->actionText,
                'actionUrl' => $this->actionUrl,
                'appName' => config('app.name', 'AREA'),
                'appUrl' => config('app.url', 'http://localhost:3000'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
