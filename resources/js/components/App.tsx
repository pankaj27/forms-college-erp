import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicForm from './DynamicForm';
import NotFound from './NotFound';
import SignInPage from './auth/SignInPage';
import RegistrationPage from './auth/RegistrationPage';
import OtpVerificationPage from './auth/OtpVerificationPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import ForgotUsernamePage from './auth/ForgotUsernamePage';
import ResendRegistrationEmailPage from './auth/ResendRegistrationEmailPage';
import ApplicantDashboardPage from './auth/ApplicantDashboardPage';
import PersonalDetailsFormPage from './applicant/PersonalDetailsFormPage';
import PersonalDetailsSummaryPage from './applicant/PersonalDetailsSummaryPage';
import ProgrammeDetailsFormPage from './applicant/ProgrammeDetailsFormPage';
import ProgrammeDetailsSummaryPage from './applicant/ProgrammeDetailsSummaryPage';
import QualificationDetailsFormPage from './applicant/QualificationDetailsFormPage';
import QualificationDetailsSummaryPage from './applicant/QualificationDetailsSummaryPage';
import CorrespondenceDetailsFormPage from './applicant/CorrespondenceDetailsFormPage';
import CorrespondenceDetailsSummaryPage from './applicant/CorrespondenceDetailsSummaryPage';
import UploadsPage from './applicant/UploadsPage';
import UploadsSummaryPage from './applicant/UploadsSummaryPage';
import PreviewPage from './applicant/PreviewPage';
import FeePage from './applicant/FeePage';
import MyTransactionsPage from './applicant/MyTransactionsPage';
import AdmissionDiscrepancyPage from './applicant/AdmissionDiscrepancyPage';

const Home: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/applicants/me');
                if (response.data?.authenticated) {
                    navigate('/applicant/dashboard');
                }
            } catch (error) {
                // User is not authenticated, stay on home page
            }
        };
        checkAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
            <header className="bg-[#0066b3] text-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[#0066b3] font-extrabold text-xl">NC</span>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold leading-tight">
                                Nursing College ERP
                            </h1>
                            <p className="text-xs md:text-sm text-blue-100">
                                Online Admission & Student Management Portal
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-4 text-sm font-medium">
                        <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition">
                            Admissions
                        </button>
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Notifications
                        </button>
                        <button className="px-3 py-1 rounded hover:bg-white/10 transition">
                            Contact
                        </button>
                    </div>
                </div>
                <div className="bg-[#004f8a]">
                    <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between text-xs md:text-sm text-blue-50">
                        <span>
                            Online admission portal for academic session {currentYear}-{currentYear + 1}
                        </span>
                        <span className="mt-1 md:mt-0">
                            For technical support mail at support@college-erp.test
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                    <div className="bg-[#fef6e3] border-l-4 border-[#f59e0b] p-3 text-sm shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <p className="font-semibold text-[#92400e]">
                                Important: Last date to apply for current admission session is 31st March {currentYear}.
                            </p>
                            <div className="mt-2 md:mt-0 space-x-2">
                                <button className="px-3 py-1 text-xs font-semibold rounded bg-[#10b981] text-white hover:bg-[#059669]">
                                    View Prospectus
                                </button>
                                <Link
                                    to="/auth/login"
                                    className="px-3 py-1 text-xs font-semibold rounded bg-[#ef4444] text-white hover:bg-[#dc2626]"
                                >
                                    Apply Online
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-3">
                            <div className="bg-white border border-blue-200 rounded shadow-sm p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-sm font-semibold text-[#0056b3]">
                                        Admission Notifications
                                    </h2>
                                    <span className="text-xs text-gray-500">Latest updates</span>
                                </div>
                                <ul className="text-xs text-gray-700 space-y-1">
                                    <li className="flex justify-between border-b border-gray-100 py-1">
                                        <span>Notification for B.Sc. Nursing Admission 2026</span>
                                        <button className="px-2 py-0.5 bg-[#10b981] text-white text-[10px] rounded">
                                            Download
                                        </button>
                                    </li>
                                    <li className="flex justify-between border-b border-gray-100 py-1">
                                        <span>List of documents required for application</span>
                                        <button className="px-2 py-0.5 bg-[#0ea5e9] text-white text-[10px] rounded">
                                            View
                                        </button>
                                    </li>
                                    <li className="flex justify-between py-1">
                                        <span>Helpline details for admission related queries</span>
                                        <button className="px-2 py-0.5 bg-[#6366f1] text-white text-[10px] rounded">
                                            Read
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
                                <h2 className="text-sm font-semibold text-[#b91c1c] mb-2">
                                    General Instructions
                                </h2>
                                <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
                                    <li>
                                        Use a valid email ID and mobile number. All communication will be sent there.
                                    </li>
                                    <li>
                                        Keep scanned copies of your photo, signature and documents ready before filling the form.
                                    </li>
                                    <li>
                                        Do not press refresh/back during payment or form submission.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-[#e0f2fe] border border-[#60a5fa] rounded shadow-sm p-3 text-sm">
                                <h2 className="font-semibold text-[#1d4ed8] mb-2">
                                    Candidate Corner
                                </h2>
                                <ul className="space-y-1 text-xs text-[#1f2937]">
                                    <li>• New Applicant Registration</li>
                                    <li>• Complete / Edit Application Form</li>
                                    <li>• Re-print Application Form</li>
                                    <li>• Download Payment Receipt</li>
                                </ul>
                                <div className="mt-3">
                                    <Link
                                        to="/auth/login"
                                        className="block w-full text-center bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold py-2 rounded"
                                    >
                                        Proceed to Application
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-[#fef2f2] border border-[#fecaca] rounded shadow-sm p-3 text-xs text-gray-700">
                                <h2 className="text-sm font-semibold text-[#b91c1c] mb-2">
                                    Helpline
                                </h2>
                                <p>For any difficulty in filling the online form, contact:</p>
                                <p className="mt-1 font-semibold">+91-98765 43210</p>
                                <p>admissions@nursing-college.test</p>
                                <p className="mt-2 text-[11px] text-gray-500">
                                    Support available on working days between 10:00 AM and 5:00 PM.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white border border-gray-200 rounded shadow-sm">
                            <div className="bg-[#0066b3] text-white text-sm font-semibold px-3 py-2 rounded-t">
                                Admission Notices
                            </div>
                            <div className="p-3 text-xs">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-1 pr-2 w-20">Date</th>
                                            <th className="py-1">Details</th>
                                            <th className="py-1 w-20 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-1 text-gray-500">01-01-{currentYear}</td>
                                            <td className="py-1">
                                                Admission notification for B.Sc. Nursing (Session 2026)
                                            </td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#10b981] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-1 text-gray-500">15-01-{currentYear}</td>
                                            <td className="py-1">Extension of last date for online application</td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#0ea5e9] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 text-gray-500">20-01-{currentYear}</td>
                                            <td className="py-1">Schedule for document verification</td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#6366f1] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded shadow-sm">
                            <div className="bg-[#16a34a] text-white text-sm font-semibold px-3 py-2 rounded-t">
                                Course Details
                            </div>
                            <div className="p-3 text-xs">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-1">Course</th>
                                            <th className="py-1 w-24 text-center">Duration</th>
                                            <th className="py-1 w-20 text-center">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-1">B.Sc. Nursing</td>
                                            <td className="py-1 text-center">4 Years</td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#0ea5e9] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-1">Post Basic B.Sc. Nursing</td>
                                            <td className="py-1 text-center">2 Years</td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#0ea5e9] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-1">GNM / Other Nursing Programs</td>
                                            <td className="py-1 text-center">3 Years</td>
                                            <td className="py-1 text-center">
                                                <button className="px-2 py-0.5 bg-[#0ea5e9] text-white text-[10px] rounded">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/login" element={<SignInPage />} />
                <Route path="/auth/register" element={<RegistrationPage />} />
                <Route path="/auth/verify-otp" element={<OtpVerificationPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/forgot-username" element={<ForgotUsernamePage />} />
                <Route path="/auth/resend-registration-email" element={<ResendRegistrationEmailPage />} />
                <Route path="/applicant/dashboard" element={<ApplicantDashboardPage />} />
                <Route path="/applicant/personal" element={<PersonalDetailsFormPage />} />
                <Route path="/applicant/personal/summary" element={<PersonalDetailsSummaryPage />} />
                <Route path="/applicant/programme" element={<ProgrammeDetailsFormPage />} />
                <Route path="/applicant/programme/summary" element={<ProgrammeDetailsSummaryPage />} />
                <Route path="/applicant/qualification" element={<QualificationDetailsFormPage />} />
                <Route
                    path="/applicant/qualification/summary"
                    element={<QualificationDetailsSummaryPage />}
                />
                <Route path="/applicant/correspondence" element={<CorrespondenceDetailsFormPage />} />
                <Route path="/applicant/correspondence/summary" element={<CorrespondenceDetailsSummaryPage />} />
                <Route path="/applicant/uploads" element={<UploadsPage />} />
                <Route path="/applicant/uploads/summary" element={<UploadsSummaryPage />} />
                <Route path="/applicant/preview" element={<PreviewPage />} />
                <Route path="/applicant/fee" element={<FeePage />} />
                <Route path="/applicant/transactions" element={<MyTransactionsPage />} />
                <Route path="/applicant/discrepancies" element={<AdmissionDiscrepancyPage />} />
                <Route path="/forms/:shortCode" element={<DynamicForm />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}
