<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Username Reminder - Nursing College ERP</title>
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
        .credentials {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 12px 16px;
            margin: 12px 0 20px;
        }
        .label {
            font-weight: 600;
            color: #374151;
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
                <p>Dear Applicant,</p>

                <p>
                    You requested a reminder of your username for the Nursing College ERP Online Admission Portal.
                    Your current login details are given below:
                </p>

                <div class="credentials">
                    <p>
                        <span class="label">Registered Email:</span>
                        <span> {{ $applicant->email }}</span>
                    </p>
                    <p>
                        <span class="label">Username (for login):</span>
                        <span> {{ $applicant->username }}</span>
                    </p>
                </div>

                <p>
                    You can now visit the applicant login page and sign in using the above username along with
                    your existing password.
                </p>

                <p class="muted">
                    If you did not request this reminder, you can ignore this email. For any difficulty in logging in,
                    please contact the admission helpdesk.
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

