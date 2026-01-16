import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SignInPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [captchaUrl, setCaptchaUrl] = useState<string>(() => `/captcha?ts=${Date.now()}`);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha?ts=${Date.now()}`);
    };

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        setSubmitting(true);
        setErrors({});
        try {
            const response = await axios.post('/api/applicants/login', {
                username,
                password,
                captcha,
            });
            if (response.data.success) {
                if (response.data.requires_otp) {
                    const emailFromResponse = response.data.email || '';
                    if (emailFromResponse) {
                        localStorage.setItem('pendingOtpEmail', emailFromResponse);
                        const apiExpiry = response.data.otp_expires_at;
                        if (apiExpiry && typeof apiExpiry === 'string') {
                            const timestamp = Date.parse(apiExpiry);
                            if (!Number.isNaN(timestamp)) {
                                localStorage.setItem('pendingOtpExpiresAt', timestamp.toString());
                            }
                        } else {
                            const expiry = Date.now() + 15 * 60 * 1000;
                            localStorage.setItem('pendingOtpExpiresAt', expiry.toString());
                        }
                    }
                    window.location.href = response.data.redirect_to || '/auth/verify-otp';
                } else {
                    window.location.href = response.data.redirect_to || '/';
                }
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: ['Login failed. Please try again.'] });
            }
            refreshCaptcha();
        } finally {
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
                <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <Link
                                        to="/auth/register"
                                        className="inline-block px-4 py-2 text-sm font-semibold rounded bg-[#0056b3] text-white hover:bg-[#004494]"
                                    >
                                        CLICK HERE FOR NEW REGISTRATION
                                    </Link>
                                </div>
                                <div className="text-xs text-gray-700 leading-relaxed">
                                    <p className="font-semibold text-[#b91c1c] mb-1">
                                        JANUARY {currentYear} Admission Cycle
                                    </p>
                                    <p>
                                        Last date for submission of Online Application: 31st January {currentYear}.
                                    </p>
                                    <p className="mt-1 font-semibold text-[#b91c1c]">
                                        Important: Please keep your documents and APAR ID ready before starting the
                                        application process.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded shadow-sm p-4 text-xs text-gray-800 space-y-2 leading-relaxed">
                            <h2 className="text-sm font-semibold text-[#0056b3]">
                                Instruction to Fill Application Form Online
                            </h2>
                            <p>
                                1. If you are a first-time applicant you are advised to read the available programme
                                information on the home page and read the instructions carefully before proceeding.
                            </p>
                            <p>
                                2. Click on the button NEW REGISTRATION that appears at the top of this page and fill
                                the required registration details.
                            </p>
                            <p className="font-semibold text-[#b91c1c]">
                                Please provide your own email and mobile number at the time of registration. Email and
                                mobile shall be verified through OTP.
                            </p>
                            <p>
                                3. After filling in the mandatory information click on the SUBMIT button. Username and
                                password will be sent to your registered email and mobile number.
                            </p>
                            <p>
                                4. Use the registered username and password to log in and continue filling your online
                                admission form.
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="bg-white border border-gray-200 rounded shadow-sm">
                            <div className="bg-[#f3f4ff] border-b border-gray-200 px-4 py-3 rounded-t">
                                <h2 className="text-sm font-semibold text-[#111827]">
                                    Registered User Login
                                </h2>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Captcha Verification
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={refreshCaptcha}
                                            className="flex-1 max-w-[160px]"
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
                                        <input
                                            type="text"
                                            className={`flex-1 border ${errors.captcha ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="Enter captcha"
                                            value={captcha}
                                            onChange={(e) => setCaptcha(e.target.value)}
                                        />
                                    </div>
                                    {errors.captcha && <p className="text-red-600 text-xs mt-1">{errors.captcha[0]}</p>}
                                </div>
                                <button
                                    className="w-full mt-2 bg-[#0066b3] hover:bg-[#004f8a] text-white text-sm font-semibold py-2 rounded disabled:opacity-60"
                                    disabled={submitting}
                                    onClick={handleLogin}
                                >
                                    {submitting ? 'Logging in...' : 'Login'}
                                </button>
                                <div className="mt-3 space-y-1 text-xs text-[#1f2937]">
                                    <p>
                                        <span className="font-semibold">Forgot Password?</span>{' '}
                                        <Link
                                            to="/auth/forgot-password"
                                            className="text-[#0066b3] hover:underline font-semibold"
                                        >
                                            Click to reset your password
                                        </Link>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Forgot Username?</span>{' '}
                                        <Link
                                            to="/auth/forgot-username"
                                            className="text-[#0066b3] hover:underline font-semibold"
                                        >
                                            Click to retrieve your username
                                        </Link>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Resend Registration Confirmation Mail?</span>{' '}
                                        <Link
                                            to="/auth/resend-registration-email"
                                            className="text-[#0066b3] hover:underline font-semibold"
                                        >
                                            Click to resend
                                        </Link>
                                    </p>
                                    <p>
                                        <span className="font-semibold">New User?</span>{' '}
                                        <Link
                                            to="/auth/register"
                                            className="text-[#0066b3] hover:underline font-semibold"
                                        >
                                            Click here to New Registration
                                        </Link>
                                    </p>
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

export default SignInPage;
