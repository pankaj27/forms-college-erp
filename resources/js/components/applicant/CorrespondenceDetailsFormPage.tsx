import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const CorrespondenceDetailsFormPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProgress, setUserProgress] = useState<any>(null);
    const navigate = useNavigate();

    // Form State
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [postOffice, setPostOffice] = useState('');
    const [postOffices, setPostOffices] = useState<string[]>([]);
    const [fetchingPostOffices, setFetchingPostOffices] = useState(false);

    // Error State
    const [errors, setErrors] = useState<any>({});

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
                // Fetch User & Progress
                const userRes = await axios.get('/api/applicants/me');
                if (userRes.data?.authenticated && userRes.data.user) {
                    const user = userRes.data.user;
                    setUserProgress(user.progress);

                    // Check if application is submitted or approved
                    if (user.status === 'submitted' || user.status === 'approved') {
                        navigate('/applicant/correspondence/summary');
                        return;
                    }
                }

                // Fetch Existing Correspondence Details
                const detailsRes = await axios.get('/api/applicants/correspondence-details');
                if (detailsRes.data?.success && detailsRes.data.data) {
                    const data = detailsRes.data.data;
                    setAddressLine1(data.address_line_1 || '');
                    setAddressLine2(data.address_line_2 || '');
                    setCity(data.city || '');
                    setPincode(data.pincode || '');
                    setPostOffice(data.post_office || '');
                    
                    // If pincode exists, fetch post offices to populate dropdown
                    if (data.pincode) {
                        fetchPostOffices(data.pincode);
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

    const fetchPostOffices = async (pin: string) => {
        if (!pin || pin.length < 6) return;
        
        setFetchingPostOffices(true);
        try {
            const response = await axios.get(`/api/applicants/post-offices/${pin}`);
            if (response.data?.success && response.data.data) {
                const offices = response.data.data.map((po: any) => po.post_office_name);
                setPostOffices(offices);
            } else {
                setPostOffices([]);
            }
        } catch (error) {
            console.error("Failed to fetch post offices", error);
            setPostOffices([]);
        } finally {
            setFetchingPostOffices(false);
        }
    };

    const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPincode(val);
        if (val.length === 6) {
            fetchPostOffices(val);
        } else {
            setPostOffices([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const response = await axios.post('/api/applicants/correspondence-details', {
                address_line_1: addressLine1,
                address_line_2: addressLine2,
                city: city,
                pincode: pincode,
                post_office: postOffice
            });

            if (response.data.success) {
                navigate('/applicant/correspondence/summary');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for errors.'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong. Please try again.'
                });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading...
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

            <main className="flex-1">
                <div className="w-full py-6 px-4 md:px-8">
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Address Line 1 */}
                                <div className="grid md:grid-cols-4 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-700">
                                        Address Line 1
                                    </label>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                            placeholder="Address Line 1"
                                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address_line_1 && (
                                            <p className="text-xs text-red-500 mt-1">{errors.address_line_1[0]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Line 2 */}
                                <div className="grid md:grid-cols-4 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-700">
                                        Address Line 2
                                    </label>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={addressLine2}
                                            onChange={(e) => setAddressLine2(e.target.value)}
                                            placeholder="Address Line 2"
                                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                errors.address_line_2 ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address_line_2 && (
                                            <p className="text-xs text-red-500 mt-1">{errors.address_line_2[0]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* City */}
                                <div className="grid md:grid-cols-4 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Enter city name"
                                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                errors.city ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.city && (
                                            <p className="text-xs text-red-500 mt-1">{errors.city[0]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Pincode */}
                                <div className="grid md:grid-cols-4 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-700">
                                        Enter your address pincode:
                                    </label>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={pincode}
                                            onChange={handlePincodeChange}
                                            maxLength={6}
                                            placeholder="Pincode"
                                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                errors.pincode ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.pincode && (
                                            <p className="text-xs text-red-500 mt-1">{errors.pincode[0]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Post Office */}
                                <div className="grid md:grid-cols-4 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-700">
                                        Select your nearest post office:
                                    </label>
                                    <div className="md:col-span-3">
                                        <select
                                            value={postOffice}
                                            onChange={(e) => setPostOffice(e.target.value)}
                                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                errors.post_office ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">-- Select Post Office --</option>
                                            {postOffices.map((po, index) => (
                                                <option key={index} value={po}>
                                                    {po}
                                                </option>
                                            ))}
                                            {/* Fallback if user wants to type or if API fails but they have a saved value that isn't in the list? 
                                                Actually, let's keep it simple. If API fails, user might be stuck. 
                                                Maybe add a text input fallback? The image shows a dropdown. 
                                                If saved value exists but not in fetched list (e.g. API down), add it to options.
                                            */}
                                            {postOffice && !postOffices.includes(postOffice) && (
                                                <option value={postOffice}>{postOffice}</option>
                                            )}
                                        </select>
                                        {fetchingPostOffices && <p className="text-xs text-blue-500 mt-1">Fetching post offices...</p>}
                                        {errors.post_office && (
                                            <p className="text-xs text-red-500 mt-1">{errors.post_office[0]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`px-8 py-2 bg-[#0066b3] text-white text-sm font-semibold rounded shadow-sm hover:bg-[#004f8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            saving ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {saving ? 'Saving...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
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

export default CorrespondenceDetailsFormPage;
