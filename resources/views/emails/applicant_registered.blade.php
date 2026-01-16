<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Successful - Nursing College ERP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f3f4f6;
            color: #111827;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            width: 100%;
            padding: 24px 0;
        }
        .container {
            max-width: 640px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }
        .header {
            background: #6b21a8;
            color: #ffffff;
            padding: 16px 24px;
        }
        .header-title {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .header-subtitle {
            margin: 4px 0 0;
            font-size: 12px;
            color: #e9d5ff;
        }
        .body {
            padding: 24px;
            font-size: 14px;
            line-height: 1.6;
        }
        .section-title {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #111827;
        }
        .credentials {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 12px 16px;
            margin: 12px 0 20px;
        }
        .credentials-row {
            margin-bottom: 4px;
        }
        .credentials-label {
            font-weight: 600;
            color: #374151;
        }
        .button {
            display: inline-block;
            padding: 10px 18px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
        }
        .muted {
            font-size: 12px;
            color: #6b7280;
            margin-top: 16px;
        }
        .footer {
            padding: 16px 24px;
            background-color: #111827;
            color: #9ca3af;
            font-size: 11px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1 class="header-title">Nursing College ERP</h1>
                <p class="header-subtitle">Online Admission Portal</p>
            </div>
            <div class="body">
                <p>Dear {{ $applicant->username }},</p>

                <p>
                    Thank you for completing your registration on the Nursing College ERP Online Admission Portal.
                    Your applicant account has been created successfully.
                </p>

                <div class="section-title">Login Credentials</div>
                <div class="credentials">
                    <div class="credentials-row">
                        <span class="credentials-label">Registered Email:</span>
                        <span> {{ $applicant->email }}</span>
                    </div>
                    <div class="credentials-row">
                        <span class="credentials-label">Username (for login):</span>
                        <span> {{ $applicant->username }}</span>
                    </div>
                </div>

                <p>
                    For security reasons, your password is not displayed in this email.
                    Please use the password you created during registration to sign in to the portal.
                </p>

                <p style="margin-top: 18px; margin-bottom: 18px;">
                    You can access the admission portal using the link below:
                </p>

                <p>
                    <a href="{{ $loginUrl }}" class="button">Go to Applicant Login</a>
                </p>

                <p class="muted">
                    If you did not initiate this registration, please ignore this message.
                    If you face any difficulty while signing in, please contact the admission helpdesk.
                </p>
            </div>
            <div class="footer">
                <div>Nursing College ERP &nbsp;|&nbsp; Online Admission Portal</div>
                <div>&copy; {{ date('Y') }} Nursing College. All rights reserved.</div>
            </div>
        </div>
    </div>
</body>
</html>

