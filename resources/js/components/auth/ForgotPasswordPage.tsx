import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [captchaUrl, setCaptchaUrl] = useState<string>(() => `/captcha?ts=${Date.now()}`);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha?ts=${Date.now()}`);
    };

    const [username, setUsername] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors({});
        setSuccessMessage('');
        try {
            const response = await axios.post('/api/applicants/forgot-password', {
                username,
                captcha,
            });
            if (response.data.success) {
                setSuccessMessage(
                    'An OTP has been sent to your registered email address to reset your password.'
                );
                setUsername('');
                setCaptcha('');
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: ['Request failed. Please try again.'] });
            }
        } finally {
            refreshCaptcha();
            setSubmitting(false);
        }
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
                                Nursing College ERP
                            </h1>
                            <p className="text-xs md:text-sm text-purple-100">
                                Online Admission & Student Management Portal
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-4 text-sm font-medium">
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Helpdesk
                        </button>
                        <Link
                            to="/auth/login"
                            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-white border border-gray-200 rounded shadow-sm max-w-2xl mx-auto">
                        <div className="border-b border-gray-200 px-4 py-3 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Request password reset
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <p>
                                Enter your registered username below, click on the <span className="font-semibold">Send</span>{' '}
                                button, and we will send you an OTP on your registered email address to reset your password.
                            </p>

                            {errors.general && (
                                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-3 py-2 text-xs">
                                    {errors.general[0]}
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-[#ecfdf3] border border-[#bbf7d0] text-[#166534] rounded px-3 py-2 text-xs">
                                    {successMessage}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                    placeholder="Enter Registered Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                {errors.username && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.username[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Captcha Verification
                                </label>
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="md:w-1/3">
                                        <button
                                            type="button"
                                            onClick={refreshCaptcha}
                                            className="block w-full"
                                        >
                                            <img
                                                src={captchaUrl}
                                                alt="Captcha"
                                                className="h-12 w-full border border-gray-300 rounded bg-[#f3f4f6] object-contain"
                                            />
                                            <p className="mt-1 text-[11px] text-gray-500 text-center">
                                                * Click on the text to change
                                            </p>
                                        </button>
                                    </div>
                                    <div className="md:flex-1">
                                        <input
                                            type="text"
                                            className={`w-full border ${errors.captcha ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            value={captcha}
                                            onChange={(e) => setCaptcha(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {errors.captcha && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.captcha[0]}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    className="px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded disabled:opacity-60"
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                >
                                    {submitting ? 'Sending...' : 'Send'}
                                </button>
                            </div>
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

export default ForgotPasswordPage;

