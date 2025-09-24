@extends('emails.layout')

@section('content')
    <h2>{{ $title }}</h2>

    <p>Hi {{ $userName }},</p>

    <div style="color: #4a5568; font-size: 16px; line-height: 1.6;">
        {!! nl2br(e($message)) !!}
    </div>

    @if($actionText && $actionUrl)
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $actionUrl }}" class="btn-primary">{{ $actionText }}</a>
        </div>
    @endif

    <div class="divider"></div>

    <p style="color: #718096; font-size: 14px;">
        This notification was sent to {{ $userEmail }}.
        If you believe you received this email in error, please contact our support team.
    </p>
@endsection
