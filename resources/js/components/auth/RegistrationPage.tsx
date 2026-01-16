import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RegistrationPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [captchaUrl, setCaptchaUrl] = useState<string>(() => `/captcha?ts=${Date.now()}`);

    const refreshCaptcha = () => {
        setCaptchaUrl(`/captcha?ts=${Date.now()}`);
    };

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [emailConfirm, setEmailConfirm] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [mobile, setMobile] = useState('');
    const [mobileConfirm, setMobileConfirm] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async () => {
        setSubmitting(true);
        setErrors({});
        setSuccessMessage('');
        try {
            const response = await axios.post('/api/applicants/register', {
                username,
                email,
                email_confirmation: emailConfirm,
                password,
                password_confirmation: passwordConfirm,
                mobile,
                mobile_confirmation: mobileConfirm,
                captcha,
            });
            if (response.data.success) {
                const responseEmail = response.data.email || email;
                if (responseEmail) {
                    localStorage.setItem('pendingOtpEmail', responseEmail);
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
                setSuccessMessage(
                    'Registration successful. Please enter the OTP sent to your email to verify your account.'
                );
                window.location.href = response.data.redirect_to || '/auth/verify-otp';
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: ['Registration failed. Please try again.'] });
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
                    <div className="lg:col-span-1">
                        <div className="bg-[#fff7ed] border border-[#fed7aa] rounded shadow-sm p-4 text-xs text-gray-800 space-y-2">
                            <h2 className="text-sm font-semibold text-[#b91c1c]">
                                Important Instructions
                            </h2>
                            <p>
                                1. Applicants are advised to read the admission instructions carefully before
                                proceeding.
                            </p>
                            <p>
                                2. Applicant can log in to the admission portal through their registered email address
                                and username only.
                            </p>
                            <p>3. Applicant must use their own active email address and mobile number.</p>
                            <p>
                                4. Email address must be functional and accessible throughout the admission process so
                                that OTP and notifications can be received.
                            </p>
                            <p>
                                5. Applicants are encouraged to use the latest version of modern web browsers for
                                filling the application form.
                            </p>
                            <p>
                                6. If you do not receive the registration OTP, please use the resend OTP option
                                available on this portal.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded shadow-sm">
                            <div className="bg-[#f3f4ff] border-b border-gray-200 px-4 py-3 rounded-t">
                                <h2 className="text-sm font-semibold text-[#111827]">
                                    Student Registration Form
                                </h2>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            UserName (Used for login)
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="UserName"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Applicant&apos;s Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="Applicant's Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Re-Enter Applicant&apos;s Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]"
                                            placeholder="Confirm Email Address"
                                            value={emailConfirm}
                                            onChange={(e) => setEmailConfirm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Password (Minimum 6 characters)
                                        </label>
                                        <input
                                            type="password"
                                            className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Re-Enter Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]"
                                            placeholder="Confirm Password"
                                            value={passwordConfirm}
                                            onChange={(e) => setPasswordConfirm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            className={`w-full border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]`}
                                            placeholder="10 Digit Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                        {errors.mobile && <p className="text-red-600 text-xs mt-1">{errors.mobile[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Re-Enter Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0066b3]"
                                            placeholder="10 Digit Mobile Number"
                                            value={mobileConfirm}
                                            onChange={(e) => setMobileConfirm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2">
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
                                    {errors.captcha && <p className="text-red-600 text-xs mt-1">{errors.captcha[0]}</p>}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        className="px-6 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded disabled:opacity-60"
                                        disabled={submitting}
                                        onClick={handleRegister}
                                    >
                                        {submitting ? 'Registering...' : 'Register'}
                                    </button>
                                </div>
                                {successMessage && (
                                    <p className="mt-2 text-sm text-green-700">
                                        {successMessage}
                                    </p>
                                )}
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

export default RegistrationPage;
