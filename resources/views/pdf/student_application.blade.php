<!DOCTYPE html>
<html>
<head>
    <title>Application Form</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #6b006b;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #6b006b;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            font-size: 14px;
        }
        .section-title {
            background-color: #f0f0f0;
            padding: 8px;
            font-weight: bold;
            border-left: 4px solid #6b006b;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .row {
            width: 100%;
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #555;
            width: 40%;
            display: inline-block;
            vertical-align: top;
        }
        .value {
            width: 58%;
            display: inline-block;
            vertical-align: top;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .photos {
            margin-top: 20px;
            text-align: center;
        }
        .photo-box {
            display: inline-block;
            margin: 0 20px;
            text-align: center;
        }
        .photo-img {
            max-width: 150px;
            max-height: 150px;
            border: 1px solid #ccc;
            padding: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Nursing College</h1>
        <p>Admission Information Bulletin</p>
        <p>Application Form - Session {{ date('Y') }}-{{ date('Y') + 1 }}</p>
    </div>

    <div style="text-align: right; margin-bottom: 20px;">
        <strong>Application ID:</strong> {{ $applicant->id }}<br>
        <strong>Date:</strong> {{ date('d M Y') }}
    </div>

    <!-- Personal Details -->
    <div class="section-title">Personal Details</div>
    @if($applicant->personalDetails)
        <div class="row">
            <span class="label">Full Name:</span>
            <span class="value">{{ $applicant->personalDetails->first_name }} {{ $applicant->personalDetails->middle_name }} {{ $applicant->personalDetails->last_name }}</span>
        </div>
        <div class="row">
            <span class="label">Father's Name:</span>
            <span class="value">{{ $applicant->personalDetails->father_name }}</span>
        </div>
        <div class="row">
            <span class="label">Mother's Name:</span>
            <span class="value">{{ $applicant->personalDetails->mother_name }}</span>
        </div>
        <div class="row">
            <span class="label">Date of Birth:</span>
            <span class="value">{{ $applicant->personalDetails->apar_dob ? \Carbon\Carbon::parse($applicant->personalDetails->apar_dob)->format('d-m-Y') : '' }}</span>
        </div>
        <div class="row">
            <span class="label">Gender:</span>
            <span class="value">{{ $applicant->personalDetails->gender }}</span>
        </div>
        <div class="row">
            <span class="label">Category:</span>
            <span class="value">{{ $applicant->personalDetails->category }}</span>
        </div>
        <div class="row">
            <span class="label">Nationality:</span>
            <span class="value">{{ $applicant->personalDetails->nationality }}</span>
        </div>
    @else
        <p>No personal details available.</p>
    @endif

    <!-- Programme Details -->
    <div class="section-title">Programme Details</div>
    @if($applicant->programmeDetails)
        <div class="row">
            <span class="label">Course Applied For:</span>
            <span class="value">{{ $applicant->programmeDetails->course_name }}</span>
        </div>
        @if($applicant->programmeDetails->branch_name)
        <div class="row">
            <span class="label">Branch:</span>
            <span class="value">{{ $applicant->programmeDetails->branch_name }}</span>
        </div>
        @endif
    @else
        <p>No programme details available.</p>
    @endif

    <!-- Correspondence Details -->
    <div class="section-title">Correspondence Details</div>
    @if($applicant->correspondenceDetails)
        <div class="row">
            <span class="label">Address:</span>
            <span class="value">{{ $applicant->correspondenceDetails->address_line1 }}, {{ $applicant->correspondenceDetails->address_line2 }}</span>
        </div>
        <div class="row">
            <span class="label">City:</span>
            <span class="value">{{ $applicant->correspondenceDetails->city }}</span>
        </div>
        <div class="row">
            <span class="label">District:</span>
            <span class="value">{{ $applicant->correspondenceDetails->district }}</span>
        </div>
        <div class="row">
            <span class="label">State:</span>
            <span class="value">{{ $applicant->correspondenceDetails->state }}</span>
        </div>
        <div class="row">
            <span class="label">Pincode:</span>
            <span class="value">{{ $applicant->correspondenceDetails->pincode }}</span>
        </div>
    @else
        <p>No correspondence details available.</p>
    @endif

    <!-- Qualification Details -->
    <div class="section-title">Qualification Details</div>
    @if($applicant->qualificationDetails)
        <table>
            <thead>
                <tr>
                    <th>Exam</th>
                    <th>Board/University</th>
                    <th>Year</th>
                    <th>Result</th>
                    <th>% / CGPA</th>
                </tr>
            </thead>
            <tbody>
                @if($applicant->qualificationDetails->tenth_board)
                <tr>
                    <td>10th (Matriculation)</td>
                    <td>{{ $applicant->qualificationDetails->tenth_board }}</td>
                    <td>{{ $applicant->qualificationDetails->tenth_year }}</td>
                    <td>{{ $applicant->qualificationDetails->tenth_result_status }}</td>
                    <td>{{ $applicant->qualificationDetails->tenth_percentage }}</td>
                </tr>
                @endif
                @if($applicant->qualificationDetails->twelfth_board)
                <tr>
                    <td>12th (Intermediate)</td>
                    <td>{{ $applicant->qualificationDetails->twelfth_board }}</td>
                    <td>{{ $applicant->qualificationDetails->twelfth_year }}</td>
                    <td>{{ $applicant->qualificationDetails->twelfth_result_status }}</td>
                    <td>{{ $applicant->qualificationDetails->twelfth_percentage }}</td>
                </tr>
                @endif
                 @if($applicant->qualificationDetails->graduation_university)
                <tr>
                    <td>Graduation</td>
                    <td>{{ $applicant->qualificationDetails->graduation_university }}</td>
                    <td>{{ $applicant->qualificationDetails->graduation_year }}</td>
                    <td>{{ $applicant->qualificationDetails->graduation_result_status }}</td>
                    <td>{{ $applicant->qualificationDetails->graduation_percentage }}</td>
                </tr>
                @endif
            </tbody>
        </table>
    @else
        <p>No qualification details available.</p>
    @endif

    <!-- Uploads -->
    <div class="section-title">Uploaded Documents</div>
    <div class="photos">
        @php
            $photo = $applicant->uploads->where('document_type', 'photo')->first();
            $signature = $applicant->uploads->where('document_type', 'signature')->first();
        @endphp

        @if($photo && file_exists(storage_path('app/public/' . $photo->file_path)))
            <div class="photo-box">
                <p><strong>Photo</strong></p>
                <!-- Note: Ideally use base64 for PDF generation to ensure images load correctly -->
                <img src="{{ storage_path('app/public/' . $photo->file_path) }}" class="photo-img" alt="Student Photo">
            </div>
        @endif

        @if($signature && file_exists(storage_path('app/public/' . $signature->file_path)))
            <div class="photo-box">
                <p><strong>Signature</strong></p>
                <img src="{{ storage_path('app/public/' . $signature->file_path) }}" class="photo-img" alt="Student Signature">
            </div>
        @endif
    </div>
    
    <div class="footer">
        <p>This is a computer-generated application form. No signature is required.</p>
        <p>&copy; {{ date('Y') }} Nursing College. All rights reserved.</p>
    </div>
</body>
</html>
