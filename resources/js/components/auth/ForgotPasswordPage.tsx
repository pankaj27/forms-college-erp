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
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async () => {
        setSubmitting(true);
        setErrors({});
        setSuccessMessage('');
        
        try {
            if (!otpSent) {
                // Step 1: Request OTP
                const response = await axios.post('/api/applicants/forgot-password', {
                    username,
                    captcha,
                });
                if (response.data.success) {
                    setSuccessMessage('An OTP has been sent to your registered email address.');
                    setOtpSent(true);
                    setCaptcha('');
                }
            } else {
                // Step 2: Reset Password
                const response = await axios.post('/api/applicants/reset-password', {
                    username,
                    otp,
                    password,
                    password_confirmation: passwordConfirmation,
                    captcha,
                });
                if (response.data.success) {
                    setSuccessMessage('Password reset successfully. Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 2000);
                }
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
                                {otpSent ? 'Reset Password' : 'Request Password Reset'}
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <p>
                                {otpSent 
                                    ? 'Enter the OTP sent to your email and your new password.'
                                    : 'Enter your registered username below, click on the Send button, and we will send you an OTP on your registered email address to reset your password.'
                                }
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

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-1">Username *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        disabled={otpSent}
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-xs text-red-600">{errors.username[0]}</p>
                                    )}
                                </div>

                                {otpSent && (
                                    <>
                                        <div>
                                            <label className="block font-medium mb-1">OTP *</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-3 py-2"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter OTP"
                                                maxLength={6}
                                            />
                                            {errors.otp && (
                                                <p className="mt-1 text-xs text-red-600">{errors.otp[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">New Password *</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Confirm New Password *</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block font-medium mb-1">Captcha *</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            className="flex-1 border border-gray-300 rounded px-3 py-2"
                                            value={captcha}
                                            onChange={(e) => setCaptcha(e.target.value)}
                                            placeholder="Enter captcha"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={captchaUrl}
                                                alt="Captcha"
                                                className="h-10 border border-gray-300 rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={refreshCaptcha}
                                                className="p-2 text-gray-500 hover:text-gray-700"
                                            >
                                                ↻
                                            </button>
                                        </div>
                                    </div>
                                    {errors.captcha && (
                                        <p className="mt-1 text-xs text-red-600">{errors.captcha[0]}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full bg-[#6b006b] hover:bg-[#5a005a] text-white font-semibold py-2 rounded shadow-sm disabled:opacity-70"
                                    >
                                        {submitting 
                                            ? 'Processing...' 
                                            : (otpSent ? 'Reset Password' : 'Send OTP')
                                        }
                                    </button>
                                </div>
                                
                                <div className="text-center pt-2">
                                    <Link to="/auth/login" className="text-[#6b006b] hover:underline text-sm">
                                        Back to Sign In
                                    </Link>
                                </div>
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
