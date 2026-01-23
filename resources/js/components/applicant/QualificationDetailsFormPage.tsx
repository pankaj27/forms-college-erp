import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const emptyQualification: QualificationDetails = {
    relevant_qualification: '',
    main_subjects: '',
    year_of_passing: '',
    division: '',
    percent_marks: '',
    board_code: '',
    board_roll_number: '',
    nad_username: '',
    nad_certificate_id: '',
};

const QualificationDetailsFormPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [details, setDetails] = useState<QualificationDetails>(emptyQualification);
    const [mainSubjectsSelection, setMainSubjectsSelection] = useState<string[]>([]);
    const [boards, setBoards] = useState<{ name: string; code: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
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

    const currentStepKey = 'qualification';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Check user status first
                const meResponse = await axios.get('/api/auth/me');
                if (meResponse.data?.authenticated && meResponse.data.user) {
                    const user = meResponse.data.user;
                    setUserProgress(user.progress);
                    
                    // Check if application is submitted or approved
                    if (user.status === 'submitted' || user.status === 'approved') {
                        navigate('/applicant/qualification/summary');
                        return;
                    }
                }

                const detailsRes = await axios.get('/api/applicants/qualification-details');

                if (detailsRes.data?.success && detailsRes.data.data) {
                    const data = detailsRes.data.data as Partial<QualificationDetails>;
                    const merged = {
                        ...emptyQualification,
                        ...data,
                    };
                    setDetails(merged);
                    if (merged.main_subjects) {
                        setMainSubjectsSelection(
                            merged.main_subjects
                                .split(',')
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0)
                        );
                    }
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    window.location.href = '/auth/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    useEffect(() => {
        const fetchBoards = async () => {
            if (!details.relevant_qualification) {
                setBoards([]);
                return;
            }

            // Only fetch for 10th or if we want to support others later
            // The requirement specifically mentions "if user selecte relevant qualification from drop down as 10th"
            // But it says "generated from the database table 'board_masters' with selected course_level value"
            // So it implies we should try fetching for any selected level if it exists in DB.

            try {
                const response = await axios.get('/api/applicants/qualification-details/boards', {
                    params: { course_level: details.relevant_qualification },
                });
                if (response.data?.success) {
                    setBoards(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch boards', err);
                setBoards([]);
            }
        };

        fetchBoards();
    }, [details.relevant_qualification]);

    const handleChange =
        (field: keyof QualificationDetails) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = e.target.value;
            setDetails((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

    const toggleSubject = (subject: string) => {
        setMainSubjectsSelection((prev) => {
            const exists = prev.includes(subject);
            const next = exists ? prev.filter((s) => s !== subject) : [...prev, subject];
            const joined = next.join(', ');
            setDetails((d) => ({
                ...d,
                main_subjects: joined,
            }));
            return next;
        });
    };

    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 50; y -= 1) {
        years.push(y);
    }

    const handleSubmit = async () => {
        const newErrors: Record<string, string[]> = {};

        if (!details.relevant_qualification) {
            newErrors.relevant_qualification = ['Relevant Qualification is required.'];
        }
        if (!details.year_of_passing) {
            newErrors.year_of_passing = ['Year of Passing is required.'];
        }
        if (!details.division) {
            newErrors.division = ['Division is required.'];
        }
        if (!details.percent_marks) {
            newErrors.percent_marks = ['Percent of Marks is required.'];
        }
        if (!details.board_code) {
            newErrors.board_code = ['Board Code is required.'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            const payload = {
                ...details,
                year_of_passing: details.year_of_passing ? parseInt(details.year_of_passing, 10) : null,
                percent_marks: details.percent_marks ? parseFloat(details.percent_marks) : null,
            };
            const response = await axios.post('/api/applicants/qualification-details', payload);
            if (response.data?.success) {
                const redirectTo: string =
                    response.data.redirect_to || '/applicant/qualification/summary';
                navigate(redirectTo.replace(window.location.origin, ''));
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else if (err.response?.status === 401) {
                window.location.href = '/auth/login';
            } else {
                setErrors({
                    general: ['Failed to save qualification details. Please try again.'],
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading qualification details...
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

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
                <div className="w-full space-y-4">
                    {errors.general && (
                        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-4 py-2 text-xs">
                            {errors.general[0]}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Qualification Details
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-xs md:text-sm">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        Relevant Qualification *
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.relevant_qualification}
                                        onChange={handleChange('relevant_qualification')}
                                    >
                                        <option value="">Select</option>
                                        <option value="10th">10th</option>
                                        <option value="10+2">10+2 or equivalent</option>
                                        <option value="DIPLOMA">Diploma</option>
                                        <option value="BACHELOR">Bachelor Degree</option>
                                        <option value="MASTER">Master Degree</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    {errors.relevant_qualification && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.relevant_qualification[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        Select Main Subject
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            'HINDI',
                                            'MATHEMATICS',
                                            'BIOLOGY',
                                            'COMMERCE',
                                            'ENGLISH',
                                            'SCIENCE',
                                            'ARTS',
                                            'OTHER',
                                        ].map((subject) => (
                                            <label
                                                key={subject}
                                                className="inline-flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    checked={mainSubjectsSelection.includes(subject)}
                                                    onChange={() => toggleSubject(subject)}
                                                />
                                                <span className="uppercase">{subject}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        Year of Passing *
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.year_of_passing}
                                        onChange={handleChange('year_of_passing')}
                                    >
                                        <option value="">Select</option>
                                        {years.map((year) => (
                                            <option key={year} value={String(year)}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.year_of_passing && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.year_of_passing[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Division *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                        value={details.division}
                                        onChange={handleChange('division')}
                                    >
                                        <option value="">Select</option>
                                        <option value="FIRST">First</option>
                                        <option value="SECOND">Second</option>
                                        <option value="THIRD">Third</option>
                                    </select>
                                    {errors.division && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.division[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        % of Marks *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter percentage of marks"
                                        value={details.percent_marks}
                                        onChange={handleChange('percent_marks')}
                                    />
                                    {errors.percent_marks && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.percent_marks[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Board Code *</label>
                                    {boards.length > 0 ? (
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                            value={details.board_code}
                                            onChange={handleChange('board_code')}
                                        >
                                            <option value="">Select Board</option>
                                            {boards.map((board) => (
                                                <option key={board.code} value={board.code}>
                                                    {board.name} ({board.code})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            placeholder="Enter board code"
                                            value={details.board_code}
                                            onChange={handleChange('board_code')}
                                        />
                                    )}
                                    {errors.board_code && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.board_code[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        Board Roll Number / University Enrolment Number
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter board roll / enrolment number"
                                        value={details.board_roll_number}
                                        onChange={handleChange('board_roll_number')}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">
                                        NAD user name (If applicable)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter NAD user name"
                                        value={details.nad_username}
                                        onChange={handleChange('nad_username')}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">
                                        NAD Certificate ID (If applicable)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Enter NAD certificate ID"
                                        value={details.nad_certificate_id}
                                        onChange={handleChange('nad_certificate_id')}
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

export default QualificationDetailsFormPage;
