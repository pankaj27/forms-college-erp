import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QualificationDetails {
    relevant_qualification?: string;
    main_subjects?: string;
    year_of_passing?: number;
    division?: string;
    percent_marks?: string | number;
    board_code?: string;
    board_roll_number?: string;
    nad_username?: string;
    nad_certificate_id?: string;
}

const QualificationDetailsSummaryPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<QualificationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const steps = [
        { key: 'personal', label: 'Personal', number: 1 },
        { key: 'programme', label: 'Programme', number: 2 },
        { key: 'qualification', label: 'Qualification', number: 3 },
        { key: 'course', label: 'Course', number: 4 },
        { key: 'correspondence', label: 'Correspondence Details', number: 5 },
        { key: 'upload', label: 'Upload', number: 6 },
        { key: 'preview', label: 'Preview', number: 7 },
        { key: 'fee', label: 'Fee', number: 8 },
    ] as const;

    const currentStepKey = 'qualification';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/api/applicants/qualification-details');
                if (response.data?.success && response.data.data) {
                    setDetails(response.data.data as QualificationDetails);
                } else {
                    navigate('/applicant/qualification');
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }
                navigate('/applicant/qualification');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [navigate]);

    if (loading || !details) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading qualification summary...
            </div>
        );
    }

    const formatDivision = (value?: string) => {
        if (!value) return '-';
        if (value === 'FIRST') return 'First';
        if (value === 'SECOND') return 'Second';
        if (value === 'THIRD') return 'Third';
        return value;
    };

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
                        <Link
                            to="/applicant/dashboard"
                            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
                <div className="bg-[#4b004b]">
                    <div className="w-full px-0 md:px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between text-xs md:text-sm text-purple-100 gap-2">
                        <div className="flex flex-wrap bg-[#5c005c] rounded">
                            {steps.map((step) => {
                                const isActive = step.key === currentStepKey;
                                return (
                                    <div
                                        key={step.key}
                                        className={`flex items-center px-3 py-1.5 border-r border-[#6b21a8] last:border-r-0 ${
                                            isActive ? 'bg-white text-[#4b004b] font-semibold' : ''
                                        }`}
                                    >
                                        <span
                                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] mr-1 ${
                                                isActive
                                                    ? 'bg-[#4b004b] text-white'
                                                    : 'bg-[#a855f7] text-white'
                                            }`}
                                        >
                                            {step.number}
                                        </span>
                                        <span>{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-2 px-3 md:px-0">
                            <span className="text-[11px] md:text-xs">
                                Admission Cycle <span className="font-semibold">July Session</span>
                            </span>
                            <span className="hidden md:inline-block">|</span>
                            <span className="mt-1 md:mt-0">
                                Session {currentYear}-{currentYear + 1}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="w-full py-6 space-y-4">
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Qualification Details
                            </h2>
                        </div>
                        <div className="p-4 text-xs md:text-sm space-y-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 text-xs md:text-sm">
                                    <tbody>
                                        <tr className="odd:bg-gray-50">
                                            <td className="w-1/2 border border-gray-200 px-3 py-1.5 font-semibold">
                                                Qualification
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.relevant_qualification || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Main Subjects
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.main_subjects || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Year of Passing
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.year_of_passing || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Percent of Marks (rounded off)
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.percent_marks ?? '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Division
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {formatDivision(details.division)}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Board Code
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.board_code || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Board Roll Number
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.board_roll_number || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                NAD Details
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.nad_username || details.nad_certificate_id
                                                    ? `${details.nad_username || ''}${
                                                          details.nad_username && details.nad_certificate_id
                                                              ? ', '
                                                              : ''
                                                      }${details.nad_certificate_id || ''}`
                                                    : '-'}
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
                            onClick={() => navigate('/applicant/qualification')}
                        >
                            Previous
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/qualification')}
                        >
                            Edit
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/forms/admission-form-2026')}
                        >
                            Next
                        </button>
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

export default QualificationDetailsSummaryPage;

