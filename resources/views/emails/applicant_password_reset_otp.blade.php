<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset OTP - Nursing College ERP</title>
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
        .otp-box {
            margin: 16px 0;
            padding: 14px 18px;
            border-radius: 4px;
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            font-size: 20px;
            letter-spacing: 6px;
            font-weight: bold;
            text-align: center;
            color: #1d4ed8;
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
                    We received a request to reset the password for your Nursing College ERP applicant account.
                    Use the One Time Password (OTP) given below on the password reset page to set a new password.
                </p>

                <div class="otp-box">
                    {{ $applicant->otp }}
                </div>

                <p>
                    This OTP is valid for <strong>15 minutes</strong>. For security reasons, do not share this
                    code with anyone. If you did not request a password reset, you can ignore this email.
                </p>

                <p class="muted">
                    For assistance, please contact the admission helpdesk.
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

