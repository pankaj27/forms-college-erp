<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicantRegistered extends Mailable
{
    use Queueable, SerializesModels;

    public Applicant $applicant;
    public string $loginUrl;

    public function __construct(Applicant $applicant, string $loginUrl)
    {
        $this->applicant = $applicant;
        $this->loginUrl = $loginUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nursing College ERP - Applicant Registration Successful',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.applicant_registered',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

