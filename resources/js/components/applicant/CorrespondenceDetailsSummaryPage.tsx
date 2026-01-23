import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CorrespondenceDetails {
    address_line_1: string;
    address_line_2: string;
    city: string;
    pincode: string;
    post_office: string;
}

const CorrespondenceDetailsSummaryPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<CorrespondenceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState<any>(null);
    const navigate = useNavigate();

    const steps = [
        { key: 'personal', label: 'Personal', number: 1, path: '/applicant/personal' },
        { key: 'programme', label: 'Programme', number: 2, path: '/applicant/programme' },
        { key: 'qualification', label: 'Qualification', number: 3, path: '/applicant/qualification' },
        { key: 'correspondence', label: 'Communication Address Details', number: 4, path: '/applicant/correspondence' },
        { key: 'uploads', label: 'Upload', number: 5, path: '/applicant/uploads' },
        { key: 'preview', label: 'Preview', number: 6, path: '/applicant/preview' },
        { key: 'fee', label: 'Fee', number: 7, path: '/applicant/fee' },
    ] as const;

    const currentStepKey = 'correspondence';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [detailsRes, userRes] = await Promise.all([
                    axios.get('/api/applicants/correspondence-details'),
                    axios.get('/api/applicants/me')
                ]);

                if (detailsRes.data?.success && detailsRes.data.data) {
                    setDetails(detailsRes.data.data as CorrespondenceDetails);
                } else {
                    navigate('/applicant/correspondence');
                    return;
                }

                if (userRes.data?.authenticated && userRes.data.user) {
                    setUserProgress(userRes.data.user.progress);
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }
                navigate('/applicant/correspondence');
                return;
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [navigate]);

    if (loading || !details) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading summary...
            </div>
        );
    }

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
                <div className="bg-[#4b004b]">
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

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
                <div className="w-full space-y-4">
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Communication Address Details Summary
                            </h2>
                        </div>
                        <div className="p-4 text-xs md:text-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-gray-200">
                                    <tbody>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold w-1/3">
                                                Address Line 1
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.address_line_1 || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Address Line 2
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.address_line_2 || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                City
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.city || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Pincode
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.pincode || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Post Office
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.post_office || '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            className="flex-1 px-6 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/correspondence')}
                        >
                            Previous
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/correspondence')}
                        >
                            Edit
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/uploads')}
                        >
                            Next
                        </button>
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

export default CorrespondenceDetailsSummaryPage;
