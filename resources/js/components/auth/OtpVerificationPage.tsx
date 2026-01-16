import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const OtpVerificationPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [captchaUrl, setCaptchaUrl] = useState<string>(() => `/captcha?ts=${Date.now()}`);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha?ts=${Date.now()}`);
    };

    const [email, setEmail] = useState<string>(() => localStorage.getItem('pendingOtpEmail') || '');
    const [otp, setOtp] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

    useEffect(() => {
        const storedEmail = localStorage.getItem('pendingOtpEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }

        const storedExpiry = localStorage.getItem('pendingOtpExpiresAt');
        if (storedExpiry) {
            const expiry = parseInt(storedExpiry, 10);
            if (!Number.isNaN(expiry)) {
                const diff = Math.floor((expiry - Date.now()) / 1000);
                setTimeLeft(diff > 0 ? diff : 0);
            }
        } else {
            const expiry = Date.now() + 15 * 60 * 1000;
            localStorage.setItem('pendingOtpExpiresAt', expiry.toString());
        }
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const paddedMins = mins.toString().padStart(2, '0');
        const paddedSecs = secs.toString().padStart(2, '0');
        return `${paddedMins} min ${paddedSecs} sec`;
    };

    const getMaskedEmail = (value: string) => {
        const parts = value.split('@');
        if (parts.length !== 2) {
            return value;
        }
        const [user, domain] = parts;
        if (user.length <= 2) {
            return `*@${domain}`;
        }
        const first = user[0];
        const last = user[user.length - 1];
        const hidden = '*'.repeat(Math.max(user.length - 2, 3));
        return `${first}${hidden}${last}@${domain}`;
    };

    const handleVerify = async () => {
        setSubmitting(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await axios.post('/api/applicants/verify-otp', {
                email,
                otp,
                captcha,
            });

            if (response.data.success) {
                setSuccessMessage('Email verified successfully. Redirecting to application form...');
                localStorage.removeItem('pendingOtpEmail');
                localStorage.removeItem('pendingOtpExpiresAt');
                window.location.href = response.data.redirect_to || '/';
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: ['OTP verification failed. Please try again.'] });
            }
            refreshCaptcha();
        } finally {
            setSubmitting(false);
        }
    };

    const isExpired = timeLeft <= 0;

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
                <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                    <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-sm px-4 py-2 rounded">
                        Please enter the <span className="font-semibold">Verification Code</span> sent to your
                        registration email address to verify your account.
                    </div>

                    <div className="bg-white border border-gray-200 rounded shadow-sm max-w-3xl mx-auto">
                        <div className="border-b border-gray-200 px-4 py-3 bg-[#f9fafb] rounded-t">
                            <h2 className="text-sm font-semibold text-[#111827]">
                                Verify Account
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <div className="bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] rounded px-3 py-2 text-xs md:text-sm">
                                <p className="font-semibold">Please do not refresh this page.</p>
                                <p className="mt-1">
                                    Time remaining to enter the OTP:&nbsp;
                                    <span className="font-semibold">
                                        {formatTime(timeLeft)}
                                    </span>
                                </p>
                            </div>

                            {errors.general && (
                                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded px-3 py-2 text-xs">
                                    {errors.general[0]}
                                </div>
                            )}

                            <div className="space-y-2">
                                <p>
                                    Enter the OTP you received on your email{' '}
                                    <span className="font-semibold">
                                        {email ? getMaskedEmail(email) : ''}
                                    </span>{' '}
                                    to verify your account.
                                </p>
                                {!email && (
                                    <p className="text-xs text-[#b91c1c]">
                                        Email information is missing. Please complete registration again.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    OTP received on Email
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    className={`w-full border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                    placeholder="Enter 6 digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                />
                                {errors.otp && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.otp[0]}
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
                                                Click on the image to change
                                            </p>
                                        </button>
                                    </div>
                                    <div className="md:flex-1">
                                        <input
                                            type="text"
                                            className={`w-full border ${errors.captcha ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="Enter captcha as shown in image"
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

                            <div className="flex justify-end">
                                <button
                                    className="px-6 py-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold rounded disabled:opacity-60"
                                    disabled={submitting || isExpired || !email}
                                    onClick={handleVerify}
                                >
                                    {isExpired ? 'OTP Expired' : submitting ? 'Verifying...' : 'Submit OTP'}
                                </button>
                            </div>

                            {isExpired && (
                                <p className="mt-2 text-xs text-[#b91c1c]">
                                    The OTP has expired. Please complete registration again to receive a new OTP.
                                </p>
                            )}

                            {successMessage && (
                                <p className="mt-2 text-sm text-green-700">
                                    {successMessage}
                                </p>
                            )}
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

export default OtpVerificationPage;

