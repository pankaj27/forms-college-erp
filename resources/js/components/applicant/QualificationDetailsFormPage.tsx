import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface QualificationRow {
    relevant_qualification: string;
    main_subjects: string;
    year_of_passing: string;
    division: string;
    percent_marks: string;
    board_code: string;
    board_roll_number: string;
}

interface QualificationDetailsState {
    qualifications: QualificationRow[];
    nad_username: string;
    nad_certificate_id: string;
}

const emptyRow: QualificationRow = {
    relevant_qualification: '',
    main_subjects: '',
    year_of_passing: '',
    division: '',
    percent_marks: '',
    board_code: '',
    board_roll_number: '',
};

const QualificationDetailsFormPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [state, setState] = useState<QualificationDetailsState>({
        qualifications: [{ ...emptyRow }],
        nad_username: '',
        nad_certificate_id: '',
    });

    // Map of row index to available boards
    const [rowBoards, setRowBoards] = useState<Record<number, { name: string; code: string }[]>>({});
    
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
                // Check user status
                const meResponse = await axios.get('/api/applicants/me');
                if (meResponse.data?.authenticated && meResponse.data.user) {
                    const user = meResponse.data.user;
                    setUserProgress(user.progress);
                    
                    if (user.status === 'submitted' || user.status === 'approved') {
                        navigate('/applicant/qualification/summary');
                        return;
                    }
                }

                const detailsRes = await axios.get('/api/applicants/qualification-details');

                if (detailsRes.data?.success && detailsRes.data.data) {
                    const data = detailsRes.data.data;
                    
                    let loadedQualifications = data.qualifications;
                    if (!Array.isArray(loadedQualifications) || loadedQualifications.length === 0) {
                        loadedQualifications = [{ ...emptyRow }];
                    }

                    setState({
                        qualifications: loadedQualifications,
                        nad_username: data.nad_username || '',
                        nad_certificate_id: data.nad_certificate_id || '',
                    });

                    // Fetch boards for loaded qualifications
                    loadedQualifications.forEach((qual: QualificationRow, index: number) => {
                        if (qual.relevant_qualification) {
                            fetchBoards(index, qual.relevant_qualification);
                        }
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

        fetchDetails();
    }, []);

    const fetchBoards = async (index: number, qualification: string) => {
        if (!qualification) {
            setRowBoards(prev => ({ ...prev, [index]: [] }));
            return;
        }

        let programeLevel = qualification;
        // Map UI values to DB values if needed
        if (qualification === '10th') programeLevel = '10th';
        else if (qualification === '10+2 th') programeLevel = '10+2 th';
        else if (qualification === 'Graduation') programeLevel = 'Bachelor';
        else if (qualification === 'Master') programeLevel = 'Master';
        
        // If "Other", maybe we don't fetch boards?
        if (qualification === 'Other') {
             setRowBoards(prev => ({ ...prev, [index]: [] }));
             return;
        }

        try {
            const response = await axios.get('/api/applicants/qualification-details/boards', {
                params: { programe_level: programeLevel },
            });
            if (response.data?.success) {
                setRowBoards(prev => ({ ...prev, [index]: response.data.data }));
            }
        } catch (err) {
            console.error('Failed to fetch boards', err);
            setRowBoards(prev => ({ ...prev, [index]: [] }));
        }
    };

    const handleRowChange = (index: number, field: keyof QualificationRow, value: string) => {
        const newQualifications = [...state.qualifications];
        newQualifications[index] = { ...newQualifications[index], [field]: value };
        
        setState(prev => ({ ...prev, qualifications: newQualifications }));

        if (field === 'relevant_qualification') {
            fetchBoards(index, value);
            // Reset board code if qualification changes
            newQualifications[index].board_code = '';
             setState(prev => ({ ...prev, qualifications: newQualifications }));
        }
    };

    const handleNadChange = (field: 'nad_username' | 'nad_certificate_id', value: string) => {
        setState(prev => ({ ...prev, [field]: value }));
    };

    const addRow = () => {
        setState(prev => ({
            ...prev,
            qualifications: [...prev.qualifications, { ...emptyRow }]
        }));
    };

    const removeRow = (index: number) => {
        if (state.qualifications.length > 1) {
            const newQualifications = state.qualifications.filter((_, i) => i !== index);
            setState(prev => ({ ...prev, qualifications: newQualifications }));
            
            // Also clean up rowBoards
            const newRowBoards = { ...rowBoards };
            delete newRowBoards[index];
            // We might need to shift keys in rowBoards or just re-fetch. 
            // Simpler to just let it be, but keys might mismatch.
            // Actually, if we remove index 0, index 1 becomes 0.
            // So we should probably rebuild rowBoards or just refetch for all (easier).
            // Or better: Re-fetch for all remaining rows to be safe.
            newQualifications.forEach((qual, idx) => {
                if (qual.relevant_qualification) fetchBoards(idx, qual.relevant_qualification);
            });
        }
    };

    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 50; y -= 1) {
        years.push(y);
    }

    const handleSubmit = async () => {
        const newErrors: Record<string, string[]> = {};

        state.qualifications.forEach((qual, index) => {
            if (!qual.relevant_qualification) newErrors[`qualifications.${index}.relevant_qualification`] = ['Required'];
            if (!qual.year_of_passing) newErrors[`qualifications.${index}.year_of_passing`] = ['Required'];
            if (!qual.division) newErrors[`qualifications.${index}.division`] = ['Required'];
            if (!qual.percent_marks) newErrors[`qualifications.${index}.percent_marks`] = ['Required'];
            if (!qual.board_code && qual.relevant_qualification !== 'Other') newErrors[`qualifications.${index}.board_code`] = ['Required'];
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill all required fields.',
            });
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            const payload = {
                qualifications: state.qualifications.map(q => ({
                    ...q,
                    year_of_passing: parseInt(q.year_of_passing, 10),
                    percent_marks: parseFloat(q.percent_marks),
                })),
                nad_username: state.nad_username,
                nad_certificate_id: state.nad_certificate_id,
            };

            const response = await axios.post('/api/applicants/qualification-details', payload);
            
            if (response.data?.success) {
                const redirectTo: string = response.data.redirect_to || '/applicant/qualification/summary';
                navigate(redirectTo.replace(window.location.origin, ''));
            } else {
                 const message = response.data?.message || 'Failed to save details.';
                 setErrors({ general: [message] });
                 Swal.fire('Error', message, 'error');
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                Swal.fire('Validation Error', 'Please check the form for errors.', 'error');
            } else if (err.response?.status === 401) {
                window.location.href = '/auth/login';
            } else {
                const msg = err.response?.data?.message || 'Failed to save details.';
                setErrors({ general: [msg] });
                Swal.fire('Error', msg, 'error');
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

    const getAvailableQualifications = (currentIndex: number) => {
        const allSelected = state.qualifications.map(q => q.relevant_qualification).filter(Boolean);
        const currentSelected = state.qualifications[currentIndex].relevant_qualification;
        
        const options = [
            { value: "10th", label: "10th" },
            { value: "10+2 th", label: "10+2 th" },
            { value: "Graduation", label: "Graduation" },
            { value: "Master", label: "Master" },
            { value: "Other", label: "Other" }
        ];

        return options.map(opt => ({
            ...opt,
            disabled: allSelected.includes(opt.value) && opt.value !== currentSelected
        }));
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

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
                <div className="w-full space-y-4">
                    {errors.general && (
                        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-4 py-2 text-xs">
                            {errors.general[0]}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-[#f9fafb] rounded-t flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Qualification Details
                            </h2>
                            <button
                                onClick={addRow}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                                + Add Qualification
                            </button>
                        </div>
                        
                        <div className="p-4 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-700 uppercase">
                                        <th className="p-2 border">Qualification</th>
                                        <th className="p-2 border">Main Subject</th>
                                        <th className="p-2 border">Year</th>
                                        <th className="p-2 border">Division</th>
                                        <th className="p-2 border">% Marks</th>
                                        <th className="p-2 border">Board/University</th>
                                        <th className="p-2 border">Roll No</th>
                                        <th className="p-2 border">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs md:text-sm">
                                    {state.qualifications.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="p-2 border align-top">
                                                <select
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={row.relevant_qualification}
                                                    onChange={(e) => handleRowChange(index, 'relevant_qualification', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {getAvailableQualifications(index).map(opt => (
                                                        !opt.disabled && (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        )
                                                    ))}
                                                </select>
                                                {errors[`qualifications.${index}.relevant_qualification`] && (
                                                    <div className="text-red-600 text-[10px] mt-1">{errors[`qualifications.${index}.relevant_qualification`][0]}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border align-top">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    placeholder="Subjects"
                                                    value={row.main_subjects}
                                                    onChange={(e) => handleRowChange(index, 'main_subjects', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 border align-top">
                                                <select
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={row.year_of_passing}
                                                    onChange={(e) => handleRowChange(index, 'year_of_passing', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                                {errors[`qualifications.${index}.year_of_passing`] && (
                                                    <div className="text-red-600 text-[10px] mt-1">{errors[`qualifications.${index}.year_of_passing`][0]}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border align-top">
                                                <select
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={row.division}
                                                    onChange={(e) => handleRowChange(index, 'division', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="First">First</option>
                                                    <option value="Second">Second</option>
                                                    <option value="Third">Third</option>
                                                </select>
                                                {errors[`qualifications.${index}.division`] && (
                                                    <div className="text-red-600 text-[10px] mt-1">{errors[`qualifications.${index}.division`][0]}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border align-top">
                                                <input
                                                    type="number"
                                                    className="w-20 border border-gray-300 rounded px-2 py-1"
                                                    min="0" max="100" step="0.01"
                                                    value={row.percent_marks}
                                                    onChange={(e) => handleRowChange(index, 'percent_marks', e.target.value)}
                                                />
                                                {errors[`qualifications.${index}.percent_marks`] && (
                                                    <div className="text-red-600 text-[10px] mt-1">{errors[`qualifications.${index}.percent_marks`][0]}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border align-top">
                                                {row.relevant_qualification === 'Other' ? (
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-2 py-1"
                                                        placeholder="Board Name"
                                                        value={row.board_code} // Using board_code field for free text if Other
                                                        onChange={(e) => handleRowChange(index, 'board_code', e.target.value)}
                                                    />
                                                ) : (
                                                    <select
                                                        className="w-full border border-gray-300 rounded px-2 py-1 max-w-[200px]"
                                                        value={row.board_code}
                                                        onChange={(e) => handleRowChange(index, 'board_code', e.target.value)}
                                                    >
                                                        <option value="">Select Board</option>
                                                        {rowBoards[index]?.map(b => (
                                                            <option key={b.code} value={b.code}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                 {errors[`qualifications.${index}.board_code`] && (
                                                    <div className="text-red-600 text-[10px] mt-1">{errors[`qualifications.${index}.board_code`][0]}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border align-top">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={row.board_roll_number}
                                                    onChange={(e) => handleRowChange(index, 'board_roll_number', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 border align-top text-center">
                                                {state.qualifications.length > 1 && (
                                                    <button
                                                        onClick={() => removeRow(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Remove Row"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-[#111827] mb-3">NAD Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">NAD Username</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={state.nad_username}
                                    onChange={(e) => handleNadChange('nad_username', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">NAD Certificate ID</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={state.nad_certificate_id}
                                    onChange={(e) => handleNadChange('nad_certificate_id', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Link
                            to="/applicant/programme"
                            className="px-6 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition text-sm font-medium"
                        >
                            Back
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-[#6b006b] text-white rounded hover:bg-[#5c005c] transition text-sm font-medium disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save & Next'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QualificationDetailsFormPage;
