import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdmissionDiscrepancyPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/api/applicants/me');
                if (response.data?.authenticated && response.data.user) {
                    setUserStatus(response.data.user.status || 'draft');
                    setRejectionReason(response.data.user.rejection_reason);
                }
            } catch (error) {
                console.error("Failed to fetch user details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

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
                    <div className="flex items-center space-x-4 text-sm font-medium">
                         <Link to="/applicant/dashboard" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition">
                            Dashboard
                        </Link>
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
                            <Link to="/applicant/discrepancies" className="font-bold text-white hover:underline">
                                Admission Discrepancy
                            </Link>
                        </div>
                        <span>
                            Session {currentYear}-{currentYear + 1}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-[#6b006b] px-6 py-4 border-b border-[#5a005a] flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Admission Discrepancy
                        </h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b006b] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Checking for discrepancies...</p>
                            </div>
                        ) : userStatus === 'rejected' && rejectionReason ? (
                            <div className="bg-red-50 border border-red-200 rounded-md p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 w-full">
                                        <h3 className="text-lg font-medium text-red-800">
                                            Discrepancy Found in Application
                                        </h3>
                                        <div className="mt-4 text-sm text-red-700 bg-white p-4 rounded border border-red-100 shadow-sm">
                                            <p className="font-semibold mb-2">Administrator Remarks:</p>
                                            <p className="whitespace-pre-wrap">{rejectionReason}</p>
                                        </div>
                                        <div className="mt-6">
                                            <p className="text-sm text-red-800 mb-3">
                                                Please review the discrepancy and update your application accordingly.
                                            </p>
                                            <Link
                                                to="/applicant/personal"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Edit Application
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-green-50 rounded-lg border border-green-200">
                                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-4 text-xl font-medium text-green-900">No Discrepancies Found</h3>
                                <p className="mt-2 text-green-600">Your application does not have any pending discrepancies raised by the administrator.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-[#1f2937] text-gray-300 text-xs mt-auto">
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

export default AdmissionDiscrepancyPage;
