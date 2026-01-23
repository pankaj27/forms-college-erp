import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PersonalDetails {
    apar_id?: string;
    apar_name?: string;
    apar_gender?: string;
    apar_dob?: string;
    certificate_name?: string;
    certificate_gender?: string;
    certificate_dob?: string;
    mother_name?: string;
    guardian_relation?: string;
    guardian_name?: string;
    category?: string;
    citizenship_country?: string;
    territory_area?: string;
    minority?: string;
    religion?: string;
    marital_status?: string;
    social_status?: string;
    email?: string;
    alternate_email?: string;
    mobile?: string;
    alternate_mobile?: string;
}

const PersonalDetailsSummaryPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<PersonalDetails | null>(null);
    const [loading, setLoading] = useState(true);
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

    const currentStepKey = 'personal';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/api/applicants/personal-details');
                if (response.data?.success && response.data.data) {
                    setDetails(response.data.data as PersonalDetails);
                } else {
                    navigate('/applicant/personal');
                    return;
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }
                navigate('/applicant/personal');
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

    const formatDate = (value?: string) => {
        if (!value) return '';
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

            <main className="flex-1">
                <div className="w-full py-6 space-y-4">
                    <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-sm px-4 py-3 rounded">
                        <p className="font-semibold">
                            APAR DETAILS : {details.apar_id || '__________'}
                        </p>
                        <p className="mt-2 text-xs">
                            Declaration accepted by applicant: I hereby declare that the personal details fetched from my
                            APAR ID &mdash; including Name, Date of Birth, and Gender &mdash; are accurate and complete to the
                            best of my knowledge and they are same as per my Class X/XII Matriculation marksheet/certificate.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Personal Details Summary
                            </h2>
                        </div>
                        <div className="p-4 text-xs md:text-sm space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">APAR Personal Information</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 text-xs md:text-sm">
                                        <tbody>
                                            <tr className="odd:bg-gray-50">
                                                <td className="w-1/2 border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Name (as per APAR)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.apar_name || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Name (as per Class X/XII/Matriculation marksheet/certificate)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.certificate_name || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Gender (as per APAR)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.apar_gender || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Gender (as per Class X/XII/Matriculation marksheet/certificate)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.certificate_gender || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Date of Birth (as per APAR)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {formatDate(details.apar_dob)}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Date of Birth (as per Class X/XII/Matriculation marksheet/certificate)
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {formatDate(details.certificate_dob)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Personal Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 text-xs md:text-sm">
                                        <tbody>
                                            <tr className="odd:bg-gray-50">
                                                <td className="w-1/2 border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Mother Name
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.mother_name || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Guardian Relation
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.guardian_relation || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Guardian Name
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.guardian_name || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Category
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.category || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Nationality
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.citizenship_country || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Area
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.territory_area || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Whether Minority
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.minority || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Religion
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.religion || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Marital Status
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.marital_status || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Social Status
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.social_status || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Applicant Email
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.email || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Alternate Email
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.alternate_email || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Mobile Number
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.mobile || '-'}
                                                </td>
                                            </tr>
                                            <tr className="odd:bg-gray-50">
                                                <td className="border border-gray-200 px-3 py-1.5 font-semibold">
                                                    Alternate Mobile Number
                                                </td>
                                                <td className="border border-gray-200 px-3 py-1.5">
                                                    {details.alternate_mobile || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            className="flex-1 px-6 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/personal')}
                        >
                            Previous
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/personal')}
                        >
                            Edit
                        </button>
                        <button
                            className="flex-1 px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded"
                            onClick={() => navigate('/applicant/programme')}
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

export default PersonalDetailsSummaryPage;
