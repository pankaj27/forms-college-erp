<!DOCTYPE html>
<html>
<head>
    <title>Application Submitted</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b006b;">Application Submitted Successfully</h2>
        <p>Dear {{ $applicant->personalDetails->first_name ?? 'Applicant' }},</p>
        
        <p>Thank you for submitting your application for admission. Your application has been successfully received and is now under review.</p>
        
        <p><strong>Application Reference ID:</strong> {{ $applicant->id }}</p>
        <p><strong>Submission Date:</strong> {{ $applicant->submitted_at ? \Carbon\Carbon::parse($applicant->submitted_at)->format('d M Y, h:i A') : date('d M Y') }}</p>
        
        <p>You can track the status of your application by logging into your dashboard.</p>
        
        <p>Please find attached a copy of your submitted application form.</p>
        
        <p>Best Regards,<br>
        Admission Cell<br>
        Nursing College</p>
    </div>
</body>
</html>
