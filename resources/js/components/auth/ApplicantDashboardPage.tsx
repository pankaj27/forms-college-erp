import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface ApplicantUser {
    id: number;
    username: string;
    email: string;
    mobile: string;
}

const ApplicantDashboardPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [user, setUser] = useState<ApplicantUser | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
            <header className="bg-[#6b006b] text-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
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
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Helpdesk
                        </button>
                        <span className="text-purple-100">
                            Logged in as <span className="font-semibold">{displayName}</span>
                        </span>
                    </div>
                </div>
                <div className="bg-[#4b004b]">
                    <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs md:text-sm text-purple-100 gap-2">
                        <div className="flex flex-wrap gap-3">
                            <Link to="/" className="hover:underline">
                                Home
                            </Link>
                            <button className="hover:underline">
                                My Applications
                            </button>
                            <button className="hover:underline">
                                My Transactions
                            </button>
                            <button className="hover:underline">
                                Admission Discrepancy
                            </button>
                        </div>
                        <span>
                            Session {currentYear}-{currentYear + 1}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                        <p className="text-sm text-gray-800">
                            {loading ? 'Loading your dashboard...' : 'Welcome '}
                            {!loading && (
                                <span className="font-semibold">
                                    {displayName}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#e0f2fe] border border-[#bae6fd] rounded shadow-sm p-4 text-sm">
                            <h2 className="text-[13px] font-semibold text-[#0f172a] mb-2">
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
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs bg-gray-50 text-gray-700"
                                    placeholder="Email not available"
                                />
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[11px] text-[#166534] font-semibold">
                                    Verified
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#ecfeff] border border-[#bae6fd] rounded shadow-sm p-4 text-sm">
                            <h2 className="text-[13px] font-semibold text-[#0f172a] mb-2">
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
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs bg-gray-50 text-gray-400"
                                    placeholder="Enter APAR ID in application form"
                                />
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[11px] text-[#92400e] font-semibold">
                                    Pending
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Application Status
                            </h2>
                            <p className="text-xs text-gray-600">
                                Control Number:{' '}
                                <span className="font-semibold">
                                    To be generated after submission
                                </span>
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="inline-flex rounded border border-gray-200 bg-gray-50 text-xs">
                                <div className="px-4 py-2 bg-[#22c55e] text-white font-semibold rounded-l">
                                    Personal
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Programme <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Qualification <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Course <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Correspondence Details{' '}
                                    <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Uploads <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200">
                                    Preview <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                                <div className="px-4 py-2 border-l border-gray-200 rounded-r">
                                    Fee <span className="ml-1 text-[11px] text-orange-600">(Pending)</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Link
                                to="/applicant/personal"
                                className="inline-flex items-center px-5 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded shadow-sm"
                            >
                                Continue Application
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#1f2937] text-gray-300 text-xs mt-4">
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

export default ApplicantDashboardPage;

