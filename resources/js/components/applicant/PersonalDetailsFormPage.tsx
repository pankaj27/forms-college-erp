import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const emptyDetails: PersonalDetails = {
    apar_id: '',
    apar_name: '',
    apar_gender: '',
    apar_dob: '',
    certificate_name: '',
    certificate_gender: '',
    certificate_dob: '',
    mother_name: '',
    guardian_relation: '',
    guardian_name: '',
    category: 'UR',
    citizenship_country: 'India',
    territory_area: 'Urban',
    minority: 'NO',
    religion: 'Hindu',
    marital_status: '',
    social_status: '',
    email: '',
    alternate_email: '',
    mobile: '',
    alternate_mobile: '',
    disability_status: '',
    employment_status: '',
    whether_minority: '',
    scholarship_amount: '',
    scholarship_department: '',
    family_income: '',
    below_poverty_line: '',
};

const PersonalDetailsFormPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<PersonalDetails>(emptyDetails);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
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

    const currentStepKey = 'personal';

    useEffect(() => {
        const fetchDetails = async () => {
            let userEmail = '';
            let userMobile = '';

            try {
                const meResponse = await axios.get('/api/auth/me');
                if (meResponse.data?.authenticated && meResponse.data.user) {
                    userEmail = meResponse.data.user.email || '';
                    userMobile = meResponse.data.user.mobile || '';
                }
            } catch (err: any) {}

            try {
                const response = await axios.get('/api/applicants/personal-details');
                if (response.data?.success && response.data.data) {
                    const data = response.data.data as Partial<PersonalDetails>;
                    setDetails({
                        ...emptyDetails,
                        ...data,
                        email: data.email ?? userEmail,
                        mobile: data.mobile ?? userMobile,
                        apar_dob: data.apar_dob ?? '',
                        certificate_dob: data.certificate_dob ?? '',
                    });
                    return;
                }

                if (userEmail || userMobile) {
                    setDetails({
                        ...emptyDetails,
                        email: userEmail,
                        mobile: userMobile,
                    });
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                    return;
                }
                if (userEmail || userMobile) {
                    setDetails({
                        ...emptyDetails,
                        email: userEmail,
                        mobile: userMobile,
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    const handleChange =
        (field: keyof PersonalDetails) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setDetails((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleSubmit = async () => {
        setErrors({});
        setSubmitting(true);
        try {
            const response = await axios.post('/api/applicants/personal-details', details);
            if (response.data?.success) {
                const redirectTo: string = response.data.redirect_to || '/applicant/personal/summary';
                navigate(redirectTo.replace(window.location.origin, ''));
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else if (err.response?.status === 401) {
                window.location.href = '/auth/login';
                return;
            } else {
                setErrors({ general: ['Failed to save details. Please try again.'] });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading personal details...
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
                                                isActive ? 'bg-[#16a34a] text-white' : 'bg-[#ef4444] text-white'
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
                    <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-sm px-4 py-3 rounded">
                        <p className="font-semibold">
                            APAR ID : {details.apar_id || '__________'}
                        </p>
                        <p className="mt-2 text-xs">
                            Declaration accepted by applicant: I hereby declare that the personal details fetched from my
                            APAR ID &mdash; including Name, Date of Birth, and Gender &mdash; are accurate and complete to the
                            best of my knowledge and they are same as per my Class X/XII Matriculation marksheet/certificate.
                        </p>
                    </div>

                    {errors.general && (
                        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-4 py-2 text-xs">
                            {errors.general[0]}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                APAR Personal Information
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-xs md:text-sm">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        Name (as per APAR)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter name exactly as printed on APAR"
                                        value={details.apar_name}
                                        onChange={handleChange('apar_name')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        Name (as per Class X/XII/Matriculation marksheet/certificate)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter name exactly as per marksheet/certificate"
                                        value={details.certificate_name}
                                        onChange={handleChange('certificate_name')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        Date of Birth (as per APAR)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={details.apar_dob}
                                        onChange={handleChange('apar_dob')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        Date of Birth (as per Class X/XII/Matriculation marksheet/certificate)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={details.certificate_dob}
                                        onChange={handleChange('certificate_dob')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        Gender (as per APAR)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter gender as per APAR"
                                        value={details.apar_gender}
                                        onChange={handleChange('apar_gender')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        Gender (as per Class X/XII/Matriculation marksheet/certificate)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter gender as per marksheet/certificate"
                                        value={details.certificate_gender}
                                        onChange={handleChange('certificate_gender')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Personal Details
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-xs md:text-sm">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Mother Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter mother name"
                                        value={details.mother_name}
                                        onChange={handleChange('mother_name')}
                                    />
                                    {errors.mother_name && (
                                        <p className="mt-1 text-xs text-red-600">{errors.mother_name[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Guardian Relation</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.guardian_relation}
                                        onChange={handleChange('guardian_relation')}
                                    >
                                        <option value="">Select</option>
                                        <option value="FATHER'S">Father's</option>
                                        <option value="MOTHER'S">Mother's</option>
                                        <option value="HUSBAND'S">Husband's</option>
                                    </select>
                                    {errors.guardian_relation && (
                                        <p className="mt-1 text-xs text-red-600">{errors.guardian_relation[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Guardian Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter guardian full name"
                                        value={details.guardian_name}
                                        onChange={handleChange('guardian_name')}
                                    />
                                    {errors.guardian_name && (
                                        <p className="mt-1 text-xs text-red-600">{errors.guardian_name[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.category}
                                        onChange={handleChange('category')}
                                    >
                                        <option value="">Select</option>
                                        <option value="UR">A1: Unreserved (UR)</option>
                                        <option value="SC">B2: SC</option>
                                        <option value="ST">C3: ST</option>
                                        <option value="OBCC">D4A: OBC (Creamy)</option>
                                        <option value="OBC">D4B: OBC (Non Creamy)</option>
                                        <option value="EWS">E5: Economically Weaker Section</option>
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-xs text-red-600">{errors.category[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Citizenship Country</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.citizenship_country}
                                        onChange={handleChange('citizenship_country')}
                                    >
                                        <option value="">Select</option>
                                        <option value="India">India</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Territory / Area</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.territory_area}
                                        onChange={handleChange('territory_area')}
                                    >
                                        <option value="">Select</option>
                                        <option value="Urban">A1: Urban</option>
                                        <option value="Rural">B2: Rural</option>
                                        <option value="Tribal">C3: Tribal</option>
                                    </select>
                                    {errors.territory_area && (
                                        <p className="mt-1 text-xs text-red-600">{errors.territory_area[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Minority</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.minority}
                                        onChange={handleChange('minority')}
                                    >
                                        <option value="">Select</option>
                                        <option value="NO">B2: No</option>
                                        <option value="YES">A1: Yes</option>
                                    </select>
                                    {errors.minority && (
                                        <p className="mt-1 text-xs text-red-600">{errors.minority[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Religion</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.religion}
                                        onChange={handleChange('religion')}
                                    >
                                        <option value="">Select</option>
                                        <option value="Hindu">A1: Hindu</option>
                                        <option value="Muslim">B2: Muslim</option>
                                        <option value="Christian">C3: Christian</option>
                                        <option value="Sikh">D4: Sikh</option>
                                        <option value="Jain">E5: Jain</option>
                                        <option value="Buddhist">F6: Buddhist</option>
                                        <option value="Parsi">G7: Parsi</option>
                                        <option value="Jews">H8: Jews</option>
                                        <option value="Other">I9: Other</option>
                                    </select>
                                    {errors.religion && (
                                        <p className="mt-1 text-xs text-red-600">{errors.religion[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Marital Status</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.marital_status}
                                        onChange={handleChange('marital_status')}
                                    >
                                        <option value="">Select</option>
                                        <option value="SINGLE">Single</option>
                                        <option value="MARRIED">Married</option>
                                    </select>
                                    {errors.marital_status && (
                                        <p className="mt-1 text-xs text-red-600">{errors.marital_status[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Social Status</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Select social status"
                                        value={details.social_status}
                                        onChange={handleChange('social_status')}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                                        placeholder="Registered email (read-only)"
                                        value={details.email}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Alternate Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter alternate email address"
                                        value={details.alternate_email}
                                        onChange={handleChange('alternate_email')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Mobile</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                                        placeholder="Registered mobile number (read-only)"
                                        value={details.mobile}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Alternate Mobile</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter alternate mobile number (optional)"
                                        value={details.alternate_mobile}
                                        onChange={handleChange('alternate_mobile')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            className="px-10 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded shadow-sm disabled:opacity-60"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
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

export default PersonalDetailsFormPage;
