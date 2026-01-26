import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface PersonalDetails {
    apar_id: string;
    apar_name: string;
    apar_gender: string;
    apar_dob: string;
    certificate_name: string;
    certificate_gender: string;
    certificate_dob: string;
    mother_name: string;
    guardian_relation: string;
    guardian_name: string;
    category: string;
    citizenship_country: string;
    territory_area: string;
    minority: string;
    religion: string;
    marital_status: string;
    social_status: string;
    email: string;
    alternate_email: string;
    mobile: string;
    alternate_mobile: string;
    disability_status: string;
    employment_status: string;
    whether_minority: string;
    scholarship_amount: string;
    scholarship_department: string;
    family_income: string;
    below_poverty_line: string;
}

interface ProgrammeDetails {
    programme_type: string;
    mode_of_study: string;
    programme_enrollment: string;
    region_code: string;
    study_center_code: string;
    medium: string;
}

interface QualificationDetails {
    relevant_qualification: string;
    main_subjects: string;
    year_of_passing: string;
    division: string;
    percent_marks: string;
    board_code: string;
    board_roll_number: string;
    nad_username: string;
    nad_certificate_id: string;
}

interface CorrespondenceDetails {
    address_line_1: string;
    address_line_2: string;
    city: string;
    pincode: string;
    post_office: string;
}

interface UploadedFile {
    id: number;
    original_name: string;
    file_size: number;
    uploaded_at: string;
    url: string;
}

const PreviewPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [userStatus, setUserStatus] = useState<string>('draft');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [personal, setPersonal] = useState<PersonalDetails | null>(null);
    const [programme, setProgramme] = useState<ProgrammeDetails | null>(null);
    const [qualification, setQualification] = useState<QualificationDetails | null>(null);
    const [correspondence, setCorrespondence] = useState<CorrespondenceDetails | null>(null);
    const [uploads, setUploads] = useState<Record<string, UploadedFile>>({});

    const steps = [
        { key: 'personal', label: 'Personal', number: 1, path: '/applicant/personal' },
        { key: 'programme', label: 'Programme', number: 2, path: '/applicant/programme' },
        { key: 'qualification', label: 'Qualification', number: 3, path: '/applicant/qualification' },
        { key: 'correspondence', label: 'Communication Address Details', number: 4, path: '/applicant/correspondence' },
        { key: 'uploads', label: 'Upload', number: 5, path: '/applicant/uploads' },
        { key: 'preview', label: 'Preview', number: 6, path: '/applicant/preview' },
        { key: 'fee', label: 'Fee', number: 7, path: '/applicant/fee' },
    ] as const;

    const currentStepKey = 'preview';
    const isEditable = userStatus === 'draft' || userStatus === 'rejected';

    const documentLabels: Record<string, string> = {
        photo: 'PHOTO',
        signature: 'SIGNATURE',
        matriculation: 'MATRICULATION MARKSHEET OR CERTIFICATE',
        '10plus2': '10+2 MARKSHEET / CERTIFICATE',
        graduation_marksheet: 'MARKSHEET OF GRADUATION',
        graduation_degree: 'DEGREE OR PROVISIONAL CERTIFICATE OF GRADUATION',
    };

    // Helper for others
    for (let i = 1; i <= 8; i++) {
        documentLabels[`others${i}`] = `OTHERS${i}`;
    }

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                const [
                    meRes,
                    personalRes,
                    programmeRes,
                    qualificationRes,
                    correspondenceRes,
                    uploadsRes
                ] = await Promise.all([
                    axios.get('/api/applicants/me'),
                    axios.get('/api/applicants/personal-details'),
                    axios.get('/api/applicants/programme-details'),
                    axios.get('/api/applicants/qualification-details'),
                    axios.get('/api/applicants/correspondence-details'),
                    axios.get('/api/applicants/uploads')
                ]);

                if (meRes.data?.authenticated && meRes.data.user) {
                    setUserProgress(meRes.data.user.progress);
                    setUserStatus(meRes.data.user.status || 'draft');
                    setRejectionReason(meRes.data.user.rejection_reason);
                }

                if (personalRes.data?.success) setPersonal(personalRes.data.data);
                if (programmeRes.data?.success) setProgramme(programmeRes.data.data);
                if (qualificationRes.data?.success) setQualification(qualificationRes.data.data);
                if (correspondenceRes.data?.success) setCorrespondence(correspondenceRes.data.data);
                if (uploadsRes.data?.success) setUploads(uploadsRes.data.data);

            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                }
                console.error("Failed to fetch details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDetails();
    }, []);

    const DetailRow = ({ label, value }: { label: string, value: string | undefined }) => (
        <tr className="border-b border-gray-100 last:border-0 print:border-gray-300">
            <td className="py-2 pr-4 text-gray-600 font-medium w-1/3 text-xs md:text-sm print:text-gray-800">{label}</td>
            <td className="py-2 text-gray-900 font-semibold w-2/3 text-xs md:text-sm">{value || '-'}</td>
        </tr>
    );

    const SectionHeader = ({ title, editPath, isEditable = true }: { title: string, editPath: string, isEditable?: boolean }) => (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200 mt-6 first:mt-0 rounded-t print:bg-transparent print:border-b-2 print:border-gray-800 print:mt-4 print:px-0">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
            {isEditable && (
                <Link to={editPath} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center print:hidden">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                </Link>
            )}
        </div>
    );

    const handleSubmitApplication = async () => {
        const result = await Swal.fire({
            title: 'Submit Application?',
            text: "Once submitted, you cannot edit your application until it is reviewed. Are you sure you want to proceed?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Submit Application'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        
        // Show loader
        Swal.fire({
            title: 'Submitting Application...',
            text: 'Please wait while we process your submission and send the confirmation email.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post('/api/applicants/submit', {}, {
                timeout: 30000 // 30 seconds timeout to allow for email sending
            });
            if (response.data?.success) {
                setUserStatus('submitted');
                
                // Show success message
                await Swal.fire({
                    title: 'Submitted!',
                    text: 'Your application has been submitted successfully. A confirmation email has been sent to your registered email address.',
                    icon: 'success',
                    confirmButtonColor: '#16a34a'
                });
            } else {
                // Handle case where success is false but status is 200
                if (response.data?.message === 'Application already submitted.') {
                    setUserStatus(response.data.status || 'submitted');
                    
                    Swal.fire({
                        title: 'Application Status',
                        text: 'Your application has already been submitted.',
                        icon: 'info'
                    });
                } else {
                    Swal.fire({
                        title: 'Submission Failed',
                        text: response.data?.message || 'Application submission failed. Please try again.',
                        icon: 'error'
                    });
                }
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.message || 
                                 (error.code === 'ECONNABORTED' ? 'Submission timed out. Please check your internet connection or try again later.' : 
                                 'Failed to submit application. Please check your connection and try again.');
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading Application Preview...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col print:bg-white">
            <header className="bg-[#6b006b] text-white print:hidden">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[#6b006b] font-extrabold text-xl">NC</span>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold leading-tight">
                                Admission Information Bulletin
                            </h1>
                            <p className="text-xs md:text-sm text-purple-100">
                                Online Admission & Student Management Portal
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4 text-xs md:text-sm font-medium">
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Helpdesk
                        </button>
                        <Link to="/applicant/dashboard" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition">
                            Dashboard
                        </Link>
                    </div>
                </div>
                <div className="bg-[#4b004b] print:hidden">
                    <div className="w-full px-0 md:px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between text-xs md:text-sm text-purple-100 gap-2">
                        <div className="flex flex-wrap bg-[#5c005c] rounded">
                            {steps.map((step) => {
                                const isActive = step.key === currentStepKey;
                                const isCompleted = userProgress?.[step.key] || step.number < steps.find((s) => s.key === currentStepKey)!.number;

                                const content = (
                                    <>
                                        <span
                                            className={`w-5 h-5 mr-1 rounded-full flex items-center justify-center text-[10px] ${
                                                isActive ? 'bg-[#16a34a] text-white' : 'bg-[#16a34a] text-white'
                                            }`}
                                        >
                                            {step.number}
                                        </span>
                                        <span className="hidden md:inline">
                                            {step.label}
                                        </span>
                                    </>
                                );

                                const className = `flex items-center px-3 md:px-4 py-2 border-r border-[#7c1a7c] text-[11px] md:text-xs ${
                                    isActive ? 'bg-white text-[#16a34a] font-semibold' : 'bg-transparent text-purple-100'
                                } ${isCompleted ? 'cursor-pointer hover:bg-white/10' : ''}`;

                                if (isCompleted) {
                                    return (
                                        <Link key={step.key} to={step.path} className={className}>
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={step.key} className={className}>
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                        <span className="mt-1 md:mt-0">
                            Session {currentYear}-{currentYear + 1}
                        </span>
                    </div>
                </div>
            </header>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-6 pt-4 px-8">
                <div className="border-b-2 border-gray-800 pb-4 mb-4">
                    <h1 className="text-3xl font-bold uppercase text-gray-900 tracking-wider">Nursing College</h1>
                    <p className="text-sm text-gray-600 font-medium">Admission Information Bulletin - Session {currentYear}-{currentYear + 1}</p>
                    <h2 className="text-2xl font-bold mt-4 uppercase underline decoration-2 underline-offset-4">Application Form</h2>
                </div>
                <div className="flex justify-between text-sm text-gray-800 font-medium mb-4">
                     <div>
                        <span className="text-gray-500 mr-2">APAR ID:</span> 
                        <span className="font-bold">{personal?.apar_id || 'N/A'}</span>
                    </div>
                     <div>
                        <span className="text-gray-500 mr-2">Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                     </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 print:p-0 print:w-full print:max-w-none">
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-6 print:border-0 print:shadow-none">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
                        <h2 className="text-lg font-bold text-gray-800">Application Preview</h2>
                        <button 
                            onClick={() => window.print()}
                            className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Application
                        </button>
                    </div>

                    {/* Status Banner */}
                    {userStatus !== 'draft' && (
                        <div className={`px-6 py-4 border-b print:hidden ${
                            userStatus === 'approved' ? 'bg-green-50 border-green-200' :
                            userStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                            'bg-blue-50 border-blue-200'
                        }`}>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {userStatus === 'approved' ? (
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : userStatus === 'rejected' ? (
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3 w-full">
                                    <h3 className={`text-sm font-medium ${
                                        userStatus === 'approved' ? 'text-green-800' :
                                        userStatus === 'rejected' ? 'text-red-800' :
                                        'text-blue-800'
                                    }`}>
                                        Application Status: {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                                    </h3>
                                    {userStatus === 'rejected' && rejectionReason && (
                                        <div className="mt-2 text-sm text-red-700">
                                            <p className="font-semibold">Reason for Rejection:</p>
                                            <p>{rejectionReason}</p>
                                            <p className="mt-2 text-xs">You can edit your application and submit it again.</p>
                                        </div>
                                    )}
                                    {userStatus === 'submitted' && (
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Your application has been submitted and is pending review. You cannot edit details at this time.</p>
                                        </div>
                                    )}
                                    {userStatus.toLowerCase() === 'approved' && (
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Your application has been approved! You can now proceed to fee payment.</p>
                                            <button
                                                className="mt-3 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold uppercase rounded shadow-sm flex items-center"
                                                onClick={() => navigate('/applicant/fee')}
                                            >
                                                Pay Fees Now
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 space-y-2">
                        {/* Personal Details */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <SectionHeader title="1. Personal Details" editPath="/applicant/personal" isEditable={isEditable} />
                            <div className="p-4">
                                <table className="w-full">
                                    <tbody>
                                        <DetailRow label="APAR ID" value={personal?.apar_id} />
                                        <DetailRow label="Name (as per APAR)" value={personal?.apar_name} />
                                        <DetailRow label="Date of Birth" value={personal?.apar_dob ? personal.apar_dob.split('-').reverse().join('-') : ''} />
                                        <DetailRow label="Gender" value={personal?.apar_gender} />
                                        <DetailRow label="Name (on Certificate)" value={personal?.certificate_name} />
                                        <DetailRow label="Father's Name" value={personal?.guardian_name} />
                                        <DetailRow label="Mother's Name" value={personal?.mother_name} />
                                        <DetailRow label="Category" value={personal?.category} />
                                        <DetailRow label="Email" value={personal?.email} />
                                        <DetailRow label="Mobile" value={personal?.mobile} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Programme Details */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <SectionHeader title="2. Programme Details" editPath="/applicant/programme" isEditable={isEditable} />
                            <div className="p-4">
                                <table className="w-full">
                                    <tbody>
                                        <DetailRow label="Programme Type" value={programme?.programme_type} />
                                        <DetailRow label="Mode of Study" value={programme?.mode_of_study} />
                                        <DetailRow label="Enrollment Number" value={programme?.programme_enrollment} />
                                        <DetailRow label="Medium" value={programme?.medium} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Qualification Details */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <SectionHeader title="3. Qualification Details" editPath="/applicant/qualification" isEditable={isEditable} />
                            <div className="p-4">
                                <table className="w-full">
                                    <tbody>
                                        <DetailRow label="Relevant Qualification" value={qualification?.relevant_qualification} />
                                        <DetailRow label="Main Subjects" value={qualification?.main_subjects} />
                                        <DetailRow label="Year of Passing" value={qualification?.year_of_passing} />
                                        <DetailRow label="Board" value={qualification?.board_code} />
                                        <DetailRow label="% Marks" value={qualification?.percent_marks} />
                                        <DetailRow label="Division" value={qualification?.division} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Correspondence Details */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <SectionHeader title="4. Communication Address" editPath="/applicant/correspondence" isEditable={isEditable} />
                            <div className="p-4">
                                <table className="w-full">
                                    <tbody>
                                        <DetailRow label="Address" value={`${correspondence?.address_line_1 || ''}, ${correspondence?.address_line_2 || ''}`} />
                                        <DetailRow label="City" value={correspondence?.city} />
                                        <DetailRow label="Pincode" value={correspondence?.pincode} />
                                        <DetailRow label="Post Office" value={correspondence?.post_office} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Uploads */}
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <SectionHeader title="5. Uploaded Documents" editPath="/applicant/uploads" isEditable={isEditable} />
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(uploads).map(([key, file]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center overflow-hidden">
                                                {['jpg', 'jpeg', 'png'].includes(file.original_name.split('.').pop()?.toLowerCase() || '') ? (
                                                    <img src={file.url} alt={key} className="w-10 h-10 object-cover rounded mr-3 border border-gray-300" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center text-gray-500">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{documentLabels[key] || key}</p>
                                                    <p className="text-[10px] text-gray-500">{file.original_name}</p>
                                                </div>
                                            </div>
                                            <a 
                                                href={file.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition whitespace-nowrap"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                    {Object.keys(uploads).length === 0 && (
                                        <p className="text-sm text-gray-500 italic col-span-2">No documents uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-between gap-4 max-w-md mx-auto mb-8 print:hidden">
                    {isEditable && (
                        <button
                            className="flex-1 px-6 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/uploads/summary')}
                        >
                            Previous
                        </button>
                    )}
                    
                    {userStatus.toLowerCase() === 'approved' ? (
                        <button
                            className="flex-1 px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded shadow-md"
                            onClick={() => navigate('/applicant/fee')}
                        >
                            Pay Fees
                        </button>
                    ) : userStatus.toLowerCase() === 'registered' ? (
                        <button
                            className="flex-1 px-6 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded shadow-md"
                            onClick={() => navigate('/applicant/fee')}
                        >
                            View Receipt
                        </button>
                    ) : (isEditable) ? (
                        <button
                            className="flex-1 px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded shadow-md flex items-center justify-center"
                            onClick={handleSubmitApplication}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                userStatus === 'rejected' ? 'Re-Submit Application' : 'Submit Application'
                            )}
                        </button>
                    ) : (
                        <button
                            className="flex-1 px-6 py-2 bg-gray-400 text-white text-sm font-semibold rounded cursor-not-allowed shadow-md"
                            disabled
                        >
                            {userStatus === 'submitted' ? 'Application Submitted' : 'Application Status: ' + userStatus}
                        </button>
                    )}
                </div>
            </main>

            <footer className="bg-[#1f2937] text-gray-300 text-xs mt-auto print:hidden">
                <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <span className="font-semibold">Nursing College ERP</span> &nbsp;|&nbsp; Online Admission Portal
                    </div>
                    <div className="text-gray-400">
                        © {currentYear} Nursing College. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PreviewPage;
