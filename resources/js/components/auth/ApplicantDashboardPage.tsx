import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ApplicantUser {
    id: number;
    username: string;
    email: string;
    mobile: string;
    status: string;
    rejection_reason: string | null;
    progress: {
        personal: boolean;
        programme: boolean;
        qualification: boolean;
        correspondence: boolean;
        uploads: boolean;
        preview: boolean;
        fee: boolean;
    };
}

const ApplicantDashboardPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [user, setUser] = useState<ApplicantUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out of the application.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post('/api/applicants/logout');
                    navigate('/auth/login');
                } catch (error) {
                    console.error('Logout failed', error);
                    // Force redirect even if API fails
                    navigate('/auth/login');
                }
            }
        });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/applicants/me');
                if (response.data?.authenticated && response.data.user) {
                    setUser(response.data.user as ApplicantUser);
                } else {
                    window.location.href = '/auth/login';
                    return;
                }
            } catch {
                window.location.href = '/auth/login';
                return;
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const displayName = user?.email || user?.username || 'Applicant';

    const steps = [
        { key: 'personal', label: 'Personal Details', path: '/applicant/personal' },
        { key: 'programme', label: 'Programme Details', path: '/applicant/programme' },
        { key: 'qualification', label: 'Qualification Details', path: '/applicant/qualification' },
        { key: 'correspondence', label: 'Communication Address Details', path: '/applicant/correspondence' },
        { key: 'uploads', label: 'Document Uploads', path: '/applicant/uploads' },
        { key: 'preview', label: 'Application Preview', path: '/applicant/preview' },
        { key: 'fee', label: 'Fee Payment', path: '/applicant/fee' },
    ];

    // Determine the first pending step to set the "Continue Application" link
    const firstPendingStep = steps.find(step => !user?.progress?.[step.key as keyof typeof user.progress]);
    
    let continueLink = '/applicant/personal';
    if (user?.status === 'Registered') {
        continueLink = '/applicant/fee';
    } else if (user?.status === 'submitted' || user?.status === 'approved') {
        continueLink = '/applicant/preview';
    } else if (firstPendingStep) {
        continueLink = firstPendingStep.path;
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 border-gray-200',
        submitted: 'bg-blue-100 text-blue-800 border-blue-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        Registered: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
            <header className="bg-[#6b006b] text-white">
                <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[#6b006b] font-extrabold text-xl">NC</span>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold leading-tight">
                                Nursing College ERP
                            </h1>
                            <p className="text-xs md:text-sm text-purple-100">
                                Online Admission & Student Management Portal
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4 text-xs md:text-sm font-medium">
                        <button 
                            onClick={handleLogout}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
                        >
                            Logout
                        </button>
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Helpdesk
                        </button>
                        <span className="text-purple-100">
                            Logged in as <span className="font-semibold">{displayName}</span>
                        </span>
                    </div>
                </div>
                <div className="bg-[#4b004b]">
                    <div className="w-full px-4 md:px-8 py-2 flex flex-wrap items-center justify-between text-xs md:text-sm text-purple-100 gap-2">
                        <div className="flex flex-wrap gap-3">
                            <Link to="/applicant/dashboard" className="hover:underline">
                                Home
                            </Link>
                            <Link to="/applicant/preview" className="hover:underline">
                                My Applications
                            </Link>
                            <Link to="/applicant/transactions" className="hover:underline">
                                My Transactions
                            </Link>
                            <Link to="/applicant/discrepancies" className="hover:underline">
                                Admission Discrepancy
                            </Link>
                        </div>
                        <span>
                            Session {currentYear}-{currentYear + 1}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="w-full px-4 md:px-8 py-6 space-y-6">
                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-sm text-gray-800">
                            {loading ? 'Loading your dashboard...' : 'Welcome, '}
                            {!loading && (
                                <span className="font-semibold text-[#6b006b]">
                                    {displayName}
                                </span>
                            )}
                        </p>
                        <div className="flex gap-2">
                            {user?.status !== 'Registered' && (
                                <Link
                                    to={continueLink}
                                    className="inline-flex items-center px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded shadow-sm transition-colors"
                                >
                                    Continue Application
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#e0f2fe] border border-[#bae6fd] rounded shadow-sm p-4 text-sm">
                            <h2 className="text-[13px] font-semibold text-[#0f172a] mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                Verify Email
                            </h2>
                            <p className="text-xs text-gray-700 mb-3">
                                Applicant Email Address (Use your own email address. This email will be used for all
                                official communication during the admission and learning period.)
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    readOnly
                                    value={user?.email || ''}
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs bg-gray-50 text-gray-700 focus:outline-none"
                                    placeholder="Email not available"
                                />
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[11px] text-[#166534] font-semibold shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#ecfeff] border border-[#bae6fd] rounded shadow-sm p-4 text-sm">
                            <h2 className="text-[13px] font-semibold text-[#0f172a] mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                                </svg>
                                APAR ID
                            </h2>
                            <p className="text-xs text-gray-700 mb-3">
                                APAR ID (12 digit unique identifier given to every learner in India under the &quot;One
                                Nation, One Student ID&quot; initiative.)
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    readOnly
                                    value=""
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs bg-gray-50 text-gray-400 focus:outline-none"
                                    placeholder="Enter APAR ID in application form"
                                />
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[11px] text-[#92400e] font-semibold shadow-sm">
                                    Pending
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                    Application Status
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Track your application progress below
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${statusColors[user?.status || 'draft']}`}>
                                    {user?.status === 'submitted' ? 'REVIEWED' : (user?.status || 'DRAFT')}
                                </div>
                            </div>
                        </div>

                        {user?.status === 'rejected' && user.rejection_reason && (
                            <div className="bg-red-50 border-b border-red-100 px-6 py-3">
                                <p className="text-xs font-semibold text-red-800 uppercase mb-1">Rejection Reason:</p>
                                <p className="text-sm text-red-700">{user.rejection_reason}</p>
                            </div>
                        )}

                        <div className="p-4">
                            <div className="flex flex-col md:flex-row w-full md:items-start justify-between">
                                {steps.map((step, index) => {
                                    const isComplete = user?.progress?.[step.key as keyof typeof user.progress];
                                    const isLast = index === steps.length - 1;
                                    
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-row md:flex-col items-start md:items-center relative group md:flex-1">
                                                {/* Vertical Line for Mobile */}
                                                {!isLast && (
                                                    <div className={`md:hidden absolute left-5 top-10 bottom-0 w-0.5 -ml-[1px] ${
                                                        isComplete ? 'bg-green-500' : 'bg-gray-200'
                                                    }`} />
                                                )}

                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 flex-shrink-0 transition-all ${
                                                    isComplete 
                                                        ? 'bg-green-100 border-green-500 text-green-700' 
                                                        : 'bg-white border-gray-300 text-gray-500'
                                                }`}>
                                                    {isComplete ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                
                                                <div className="ml-4 md:ml-0 md:mt-2 text-left md:text-center pb-8 md:pb-0">
                                                    <div className={`text-xs font-semibold uppercase mb-1 ${isComplete ? 'text-green-700' : 'text-gray-500'}`}>
                                                        {step.label}
                                                    </div>
                                                    <div className="text-[10px]">
                                                        {isComplete ? (
                                                            <Link to={step.path} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                                                {step.key === 'preview' ? 'Completed' : 'View Details'}
                                                            </Link>
                                                        ) : (
                                                            step.key === 'fee' ? (
                                                                <span className="text-gray-500 italic">After application form is confirmed</span>
                                                            ) : (
                                                                <Link to={step.path} className="text-gray-400 hover:text-gray-600 hover:underline">
                                                                    Pending
                                                                </Link>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Horizontal Line for Desktop */}
                                            {!isLast && (
                                                <div className={`hidden md:block flex-1 h-0.5 min-w-[30px] mx-2 mt-5 transition-colors ${
                                                    isComplete ? 'bg-green-500' : 'bg-gray-200'
                                                }`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#1f2937] text-gray-300 text-xs mt-4">
                <div className="w-full px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
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

export default ApplicantDashboardPage;
