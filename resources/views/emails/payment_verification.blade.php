<!DOCTYPE html>
<html>
<head>
    <title>Registration Successful - Payment Pending Verification</title>
</head>
<body>
    <h2>Dear {{ $applicant->personalDetails->apar_name ?? 'Applicant' }},</h2>
    <p>Your registration is successfully done.</p>
    <p>We have received your bank transfer details. We need to verify your payment. Please check your email for further updates regarding your admission status.</p>
    <p>Thank you for applying to Nursing College.</p>
    <p>Best Regards,<br>Admission Team</p>
</body>
</html>
