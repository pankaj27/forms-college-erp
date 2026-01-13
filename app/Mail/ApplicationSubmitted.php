<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public $submission;
    public $form;
    protected $pdfOutput;
    protected $uploadedFiles;

    /**
     * Create a new message instance.
     */
    public function __construct($submission, $form, $pdfOutput, $uploadedFiles = [])
    {
        $this->submission = $submission;
        $this->form = $form;
        $this->pdfOutput = $pdfOutput;
        $this->uploadedFiles = $uploadedFiles;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Submitted - ' . $this->form->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.application_submitted',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [
            Attachment::fromData(fn () => $this->pdfOutput, 'Application_Form.pdf')
                ->withMime('application/pdf'),
        ];

        foreach ($this->uploadedFiles as $file) {
            // Check if file exists in storage
            $fullPath = storage_path('app/public/' . $file);
            if (file_exists($fullPath)) {
                $attachments[] = Attachment::fromPath($fullPath);
            }
        }

        return $attachments;
    }
}
