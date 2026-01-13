<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h2 {
            color: #0056b3;
        }
        .content {
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #0056b3;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 3px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Received Successfully</h2>
        </div>
        <div class="content">
            <p>Dear Candidate,</p>
            <p>Thank you for submitting your application for <strong>{{ $form->title }}</strong>.</p>
            <p>We have successfully received your application. Your reference number is <strong>#{{ str_pad($submission->id, 6, '0', STR_PAD_LEFT) }}</strong>.</p>
            <p>Please find attached a PDF copy of your submitted application form along with the documents you uploaded.</p>
            <p>We will review your application and get back to you shortly.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Nursing College ERP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
