import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface BranchOption {
    id: number;
    name: string;
    code: string;
}

interface ProgrammeTypeOption {
    id: number;
    name: string;
    code: string;
}

interface ProgrammeOption {
    id: number;
    name: string;
    code: string;
}

interface ProgrammeDetails {
    programme_type: string;
    mode_of_study: string;
    programme_enrollment: string;
    region_code: string;
    study_center_code: string;
    medium: string;
}

const emptyProgramme: ProgrammeDetails = {
    programme_type: '',
    mode_of_study: '',
    programme_enrollment: '',
    region_code: '',
    study_center_code: '',
    medium: '',
};

const ProgrammeDetailsFormPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<ProgrammeDetails>(emptyProgramme);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [programmeTypes, setProgrammeTypes] = useState<ProgrammeTypeOption[]>([]);
    const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
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

    const currentStepKey = 'programme';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Check user status first
                const userRes = await axios.get('/api/applicants/me');

                if (userRes.data?.authenticated && userRes.data.user) {
                    const user = userRes.data.user;
                    setUserProgress(user.progress);

                    // Check if application is submitted or approved
                    if (user.status === 'submitted' || user.status === 'approved') {
                        navigate('/applicant/programme/summary');
                        return;
                    }
                }

                const detailsRes = await axios.get('/api/applicants/programme-details');

                if (detailsRes.data?.success && detailsRes.data.data) {
                    const data = detailsRes.data.data as Partial<ProgrammeDetails>;
                    setDetails({
                        ...emptyProgramme,
                        ...data,
                    });
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                }
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

        const fetchProgrammeTypes = async () => {
            try {
                const response = await axios.get('/api/applicants/programme-types');

                if (response.data?.success && Array.isArray(response.data.data)) {
                    setProgrammeTypes(response.data.data as ProgrammeTypeOption[]);
                }
            } catch (err: any) {
                console.error('Failed to fetch programme types', err);
            }
        };

        fetchDetails();
        fetchBranches();
        fetchProgrammeTypes();
    }, []);

    // Fetch programmes when programme_type changes
    useEffect(() => {
        const fetchProgrammes = async () => {
            if (!details.programme_type) {
                setProgrammes([]);
                return;
            }

            try {
                const response = await axios.get('/api/applicants/programmes', {
                    params: { programme_type_code: details.programme_type }
                });

                if (response.data?.success && Array.isArray(response.data.data)) {
                    setProgrammes(response.data.data as ProgrammeOption[]);
                }
            } catch (err: any) {
                console.error('Failed to fetch programmes', err);
            }
        };

        fetchProgrammes();
    }, [details.programme_type]);

    const handleChange =
        (field: keyof ProgrammeDetails) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = e.target.value;
            setDetails((prev) => {
                if (field === 'programme_type') {
                    return {
                        ...prev,
                        programme_type: value,
                        programme_enrollment: '',
                    };
                }

                return {
                    ...prev,
                    [field]: value,
                };
            });
        };

    const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const branchId = e.target.value;
        const selectedBranch = branches.find((branch) => String(branch.id) === branchId);

        setDetails((prev) => ({
            ...prev,
            region_code: branchId,
            study_center_code: selectedBranch ? selectedBranch.code : '',
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next.region_code;
            delete next.study_center_code;
            return next;
        });
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string[]> = {};

        if (!details.programme_type) {
            newErrors.programme_type = ['Programme Type is required.'];
        }
        if (!details.mode_of_study) {
            newErrors.mode_of_study = ['Mode Of Study is required.'];
        }
        if (!details.programme_enrollment) {
            newErrors.programme_enrollment = ['Programme For Enrollment is required.'];
        }
        if (!details.region_code) {
            newErrors.region_code = ['Select Campus is required.'];
        }
        if (!details.study_center_code) {
            newErrors.study_center_code = ['Branch Code / Institute Code is required.'];
        }
        if (!details.medium) {
            newErrors.medium = ['Medium is required.'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            const response = await axios.post('/api/applicants/programme-details', details);
            if (response.data?.success) {
                const redirectTo: string = response.data.redirect_to || '/applicant/programme/summary';
                navigate(redirectTo.replace(window.location.origin, ''));
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else if (err.response?.status === 401) {
                window.location.href = '/auth/login';
                return;
            } else {
                setErrors({ general: ['Failed to save programme details. Please try again.'] });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading programme details...
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
                                const isCompleted = step.number < steps.find((s) => s.key === currentStepKey)!.number;

                                const content = (
                                    <>
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
                    {errors.general && (
                        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-4 py-2 text-xs">
                            {errors.general[0]}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Programme Details
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-xs md:text-sm">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Programme Type *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.programme_type}
                                        onChange={handleChange('programme_type')}
                                    >
                                        <option value="">Select</option>
                                        {programmeTypes.map((type) => (
                                            <option key={type.id} value={type.code}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.programme_type && (
                                        <p className="mt-1 text-xs text-red-600">{errors.programme_type[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Mode Of Study *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.mode_of_study}
                                        onChange={handleChange('mode_of_study')}
                                    >
                                        <option value="">Select</option>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="DISTANCE">Distance</option>
                                    </select>
                                    {errors.mode_of_study && (
                                        <p className="mt-1 text-xs text-red-600">{errors.mode_of_study[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Select Programme For Enrollment *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.programme_enrollment}
                                        onChange={handleChange('programme_enrollment')}
                                        disabled={!details.programme_type}
                                    >
                                        <option value="">Select</option>
                                        {programmes.map((programme) => (
                                            <option key={programme.id} value={programme.name}>
                                                {programme.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.programme_enrollment && (
                                        <p className="mt-1 text-xs text-red-600">{errors.programme_enrollment[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Select Campus *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.region_code}
                                        onChange={handleCampusChange}
                                    >
                                        <option value="">Select</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={String(branch.id)}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.region_code && (
                                        <p className="mt-1 text-xs text-red-600">{errors.region_code[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Branch Code / Institute Code *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                                        placeholder="Branch code will be filled automatically"
                                        value={details.study_center_code}
                                        readOnly
                                    />
                                    {errors.study_center_code && (
                                        <p className="mt-1 text-xs text-red-600">{errors.study_center_code[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Medium *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.medium}
                                        onChange={handleChange('medium')}
                                    >
                                        <option value="">Select</option>
                                        <option value="ENGLISH">English</option>
                                        <option value="HINDI">Hindi</option>
                                    </select>
                                    {errors.medium && (
                                        <p className="mt-1 text-xs text-red-600">{errors.medium[0]}</p>
                                    )}
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

export default ProgrammeDetailsFormPage;
