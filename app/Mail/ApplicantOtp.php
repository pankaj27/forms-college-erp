<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicantOtp extends Mailable
{
    use Queueable, SerializesModels;

    public Applicant $applicant;

    public function __construct(Applicant $applicant)
    {
        $this->applicant = $applicant;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nursing College ERP - Email Verification OTP',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant_otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

