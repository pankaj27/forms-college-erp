<!DOCTYPE html>
<html>
<head>
    <title>Registration Successful</title>
</head>
<body>
    <h2>Dear {{ $applicant->personalDetails->apar_name ?? 'Applicant' }},</h2>
    <p>Congratulations! Your registration has been successfully completed.</p>
    <p>We have received your payment via online gateway.</p>
    <p>Thank you for applying to Nursing College.</p>
    <p>Best Regards,<br>Admission Team</p>
</body>
</html>
