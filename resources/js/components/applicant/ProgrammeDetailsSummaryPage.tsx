import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface BranchOption {
    id: number;
    name: string;
    code: string;
}

interface ProgrammeDetails {
    programme_type?: string;
    mode_of_study?: string;
    programme_enrollment?: string;
    region_code?: string;
    study_center_code?: string;
    medium?: string;
}

const ProgrammeDetailsSummaryPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<ProgrammeDetails | null>(null);
    const [branches, setBranches] = useState<BranchOption[]>([]);
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

    const currentStepKey = 'programme';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/api/applicants/programme-details');

                if (response.data?.success && response.data.data) {
                    setDetails(response.data.data as ProgrammeDetails);
                } else {
                    navigate('/applicant/programme');
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }
                navigate('/applicant/programme');
            } finally {
                setLoading(false);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await axios.get('/api/applicants/branches');

                if (response.data?.success && Array.isArray(response.data.data)) {
                    setBranches(response.data.data as BranchOption[]);
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                }
            }
        };

        fetchDetails();
        fetchBranches();
    }, [navigate]);

    const formatProgrammeType = (value?: string) => {
        if (!value) return '-';
        if (value === 'DIPLOMA') return 'Diploma';
        if (value === 'BACHELOR') return 'Bachelor';
        if (value === 'CERTIFICATE') return 'Certificate';
        return value;
    };

    const formatModeOfStudy = (value?: string) => {
        if (!value) return '-';
        if (value === 'FULL_TIME') return 'Full Time';
        if (value === 'PART_TIME') return 'Part Time';
        if (value === 'DISTANCE') return 'Distance';
        return value;
    };

    const getCampusName = () => {
        if (!details || !details.region_code) return '-';
        const branch = branches.find((b) => String(b.id) === String(details.region_code));
        return branch ? branch.name : details.region_code || '-';
    };

    if (loading || !details) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading programme summary...
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
                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        className={`flex items-center px-3 md:px-4 py-2 border-r border-[#7c1a7c] text-[11px] md:text-xs ${
                                            isActive ? 'bg-white text-[#16a34a] font-semibold' : 'bg-transparent text-purple-100'
                                        }`}
                                        disabled={!isActive}
                                    >
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
                                    </button>
                                );
                            })}
                        </div>
                        <span className="mt-1 md:mt-0">
                            Session {currentYear}-{currentYear + 1}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="w-full py-6 space-y-4">
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Programme Details
                            </h2>
                        </div>
                        <div className="p-4 text-xs md:text-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 text-xs md:text-sm">
                                    <tbody>
                                        <tr className="odd:bg-gray-50">
                                            <td className="w-1/2 border border-gray-200 px-3 py-1.5 font-semibold">
                                                Programme Type
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {formatProgrammeType(details.programme_type)}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Mode Of Study
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {formatModeOfStudy(details.mode_of_study)}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Programme For Enrollment
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.programme_enrollment || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Select Campus
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {getCampusName()}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Branch Code / Institute Code
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.study_center_code || '-'}
                                            </td>
                                        </tr>
                                        <tr className="odd:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                Medium
                                            </td>
                                            <td className="border border-gray-200 px-3 py-1.5">
                                                {details.medium || '-'}
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
                            onClick={() => navigate('/applicant/programme')}
                        >
                            Previous
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/programme')}
                        >
                            Edit
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/qualification')}
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

export default ProgrammeDetailsSummaryPage;

