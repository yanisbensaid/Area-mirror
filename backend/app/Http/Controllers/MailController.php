<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeMail;
use App\Mail\NotificationMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class MailController extends Controller
{
    /**
     * Send a welcome email to a user
     */
    public function sendWelcomeEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'custom_message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);
            $customMessage = $request->custom_message;

            Mail::to($user->email)->send(new WelcomeMail($user, $customMessage));

            return response()->json([
                'message' => 'Welcome email sent successfully',
                'recipient' => $user->email
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a notification email to a user
     */
    public function sendNotificationEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'action_text' => 'nullable|string|max:100',
            'action_url' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);

            Mail::to($user->email)->send(new NotificationMail(
                $user,
                $request->subject,
                $request->title,
                $request->message,
                $request->action_text,
                $request->action_url
            ));

            return response()->json([
                'message' => 'Notification email sent successfully',
                'recipient' => $user->email
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send email to multiple users
     */
    public function sendBulkEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'subject' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'action_text' => 'nullable|string|max:100',
            'action_url' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $users = User::whereIn('id', $request->user_ids)->get();
            $sentEmails = [];
            $failedEmails = [];

            foreach ($users as $user) {
                try {
                    Mail::to($user->email)->send(new NotificationMail(
                        $user,
                        $request->subject,
                        $request->title,
                        $request->message,
                        $request->action_text,
                        $request->action_url
                    ));
                    $sentEmails[] = $user->email;
                } catch (\Exception $e) {
                    $failedEmails[] = [
                        'email' => $user->email,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'message' => 'Bulk email process completed',
                'sent_count' => count($sentEmails),
                'failed_count' => count($failedEmails),
                'sent_emails' => $sentEmails,
                'failed_emails' => $failedEmails
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process bulk email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test email configuration
     */
    public function testEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create a test user object
            $testUser = new User([
                'name' => 'Test User',
                'email' => $request->email
            ]);

            Mail::to($request->email)->send(new NotificationMail(
                $testUser,
                'Test Email - AREA Platform',
                'Email Configuration Test',
                'This is a test email to verify that your AREA platform email configuration is working correctly. If you received this email, everything is set up properly!',
                'Visit Dashboard',
                config('app.url', 'http://localhost:3000')
            ));

            return response()->json([
                'message' => 'Test email sent successfully',
                'recipient' => $request->email
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send test email',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
