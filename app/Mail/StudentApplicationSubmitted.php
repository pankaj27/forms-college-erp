<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentApplicationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;
    public $session;
    protected $pdfOutput;

    /**
     * Create a new message instance.
     */
    public function __construct(Applicant $applicant, $pdfOutput)
    {
        $this->applicant = $applicant;
        $this->pdfOutput = $pdfOutput;
        $year = date('Y');
        $this->session = $year . '-' . ($year + 1);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Confirmation - ' . $this->session,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.student_application_submitted',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfOutput, 'Application_Form.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
