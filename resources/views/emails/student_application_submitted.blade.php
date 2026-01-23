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
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Application Reference ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $applicant->id }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Programme Enrollment:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $applicant->programmeDetails->programme_enrollment ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Campus:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $applicant->programmeDetails->study_center_code ?? 'Main Campus' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Session:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ date('Y') }}-{{ date('Y') + 1 }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Submission Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $applicant->submitted_at ? \Carbon\Carbon::parse($applicant->submitted_at)->format('d M Y, h:i A') : date('d M Y') }}</td>
            </tr>
        </table>
        
        <p>You can track the status of your application by logging into your dashboard.</p>
        
        <p>Best Regards,<br>
        Admission Cell<br>
        Nursing College</p>
    </div>
</body>
</html>
