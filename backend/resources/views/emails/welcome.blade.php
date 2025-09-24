@extends('emails.layout')

@section('content')
    <h2>Welcome to {{ $appName }}, {{ $userName }}! 🎉</h2>

    <p>Thank you for joining our automation platform! We're excited to have you on board.</p>

    <p>With {{ $appName }}, you can:</p>
    <ul style="color: #4a5568; font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
        <li>Connect your favorite services and applications</li>
        <li>Create powerful automation workflows</li>
        <li>Save time by automating repetitive tasks</li>
        <li>Monitor and manage your automations in real-time</li>
    </ul>

    @if($customMessage)
        <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #2c5282; font-style: italic;">{{ $customMessage }}</p>
        </div>
    @endif

    <p>Ready to get started? Click the button below to explore your dashboard:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $appUrl }}" class="btn-primary">Get Started</a>
    </div>

    <div class="divider"></div>

    <p><strong>Your account details:</strong></p>
    <ul style="color: #4a5568; font-size: 14px; background-color: #f7fafc; padding: 15px; border-radius: 4px; list-style: none;">
        <li><strong>Name:</strong> {{ $userName }}</li>
        <li><strong>Email:</strong> {{ $userEmail }}</li>
        <li><strong>Account created:</strong> {{ now()->format('F j, Y \a\t g:i A') }}</li>
    </ul>

    <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
@endsection
