import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface FeeDetail {
    head_name: string;
    amount: string;
}

interface FeeGroup {
    group_name: string;
    description: string;
    total_amount: string;
    details: FeeDetail[];
    due_date: string;
}

const FeePage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [userStatus, setUserStatus] = useState<string>('draft');
    const [feeData, setFeeData] = useState<FeeGroup | null>(null);
    
    // Payment State
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'bank_transfer' | null>(null);
    const [gateways, setGateways] = useState<any[]>([]);
    const [loadingGateways, setLoadingGateways] = useState(false);
    const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [collegeBankDetails, setCollegeBankDetails] = useState<any>(null);

    // Bank Transfer Form State
    const [bankDetails, setBankDetails] = useState({
        bank_name: '',
        transaction_id: '',
        transaction_date: '',
        proof_document: null as File | null
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const currentStepKey = 'fee';

    const verifyPayment = async (orderId: string) => {
        setSubmitting(true);
        try {
            const response = await axios.post('/api/applicants/payment/verify', { order_id: orderId });
            if (response.data.success) {
                await Swal.fire('Payment Verified', 'Your registration is complete.', 'success');
                setUserStatus('Registered');
                setShowPaymentOptions(false);
            } else {
                 Swal.fire('Info', response.data.message || 'Payment not completed.', 'info');
            }
        } catch (error: any) {
             console.error(error);
             Swal.fire('Error', 'Failed to verify payment.', 'error');
        } finally {
            setSubmitting(false);
             // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const orderId = query.get('order_id');
        if (orderId && userStatus !== 'Registered') {
            verifyPayment(orderId);
        }
    }, [userStatus]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Check User Status
                const userRes = await axios.get('/api/applicants/me');
                if (userRes.data?.authenticated && userRes.data.user) {
                    const status = userRes.data.user.status || 'draft';
                    setUserProgress(userRes.data.user.progress);
                    setUserStatus(status);

                    // 2. Logic for redirection
                    const normalizedStatus = status.toLowerCase();
                    if (normalizedStatus !== 'approved' && normalizedStatus !== 'registered') {
                        navigate('/applicant/preview');
                        return;
                    }
                    
                    if (normalizedStatus === 'registered') {
                         // If already registered, maybe show receipt or block payment
                         // For now we allow viewing fees but maybe block payment actions
                    }

                    // 3. Fetch Fees if Approved
                    try {
                        const feeRes = await axios.get('/api/fees/On%20Admission');
                        if (feeRes.data.success) {
                            setFeeData(feeRes.data);
                        }
                    } catch (feeErr) {
                        console.error("Failed to fetch fees", feeErr);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to load fee details.'
                        });
                    }

                    // 4. Fetch Active Gateways
                    try {
                        setLoadingGateways(true);
                        const gatewayRes = await axios.get('/api/applicants/payment/gateways');
                        if (gatewayRes.data.success) {
                            setGateways(gatewayRes.data.gateways);
                            if (gatewayRes.data.bank_details) {
                                setCollegeBankDetails(gatewayRes.data.bank_details);
                            }
                        }
                    } catch (gwErr) {
                        console.error("Failed to fetch gateways", gwErr);
                    } finally {
                        setLoadingGateways(false);
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
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBankDetails({ ...bankDetails, proof_document: e.target.files[0] });
        }
    };

    const handleBankTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feeData) return;

        if (!bankDetails.proof_document) {
            Swal.fire('Error', 'Please upload the payment proof.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('amount', feeData.total_amount);
        formData.append('bank_name', bankDetails.bank_name);
        formData.append('transaction_id', bankDetails.transaction_id);
        formData.append('transaction_date', bankDetails.transaction_date);
        formData.append('proof_document', bankDetails.proof_document);

        setSubmitting(true);
        try {
            const response = await axios.post('/api/applicants/payment/bank-transfer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                await Swal.fire({
                    title: 'Payment Submitted',
                    text: 'Your payment details have been submitted for verification. Please check your email.',
                    icon: 'success'
                });
                setUserStatus('Registered');
                setShowPaymentOptions(false);
            }
        } catch (error: any) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to submit payment details.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGatewayPayment = async () => {
        if (!feeData) return;

        if (!selectedGatewayId) {
            Swal.fire('Warning', 'Please select a payment gateway to proceed.', 'warning');
            return;
        }
            
        setSubmitting(true);

        if (selectedGatewayId === 'cashfree') {
            try {
                const res = await axios.post('/api/applicants/payment/create-order', {
                    amount: feeData.total_amount
                });
                
                if (res.data.success) {
                    const cashfree = new (window as any).Cashfree({
                        mode: res.data.mode || "sandbox"
                    });
                    cashfree.checkout({
                        paymentSessionId: res.data.payment_session_id
                    });
                    setSubmitting(false); 
                } else {
                    throw new Error(res.data.message);
                }
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to initiate payment.', 'error');
                setSubmitting(false);
            }
            return;
        }
            
        // Simulate Payment Processing Delay for other gateways
        Swal.fire({
            title: 'Processing Payment...',
            text: 'Please do not refresh the page.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        setTimeout(async () => {
            try {
                // Simulate Success
                const response = await axios.post('/api/applicants/payment/gateway-success', {
                    amount: feeData.total_amount,
                    transaction_id: 'TXN_' + Math.floor(Math.random() * 1000000000),
                    payment_method: selectedGatewayId
                });

                if (response.data.success) {
                    await Swal.fire({
                        title: 'Payment Successful',
                        text: 'Your registration is complete. A confirmation email has been sent.',
                        icon: 'success'
                    });
                    setUserStatus('Registered');
                    setShowPaymentOptions(false);
                }
            } catch (error: any) {
                Swal.fire('Error', 'Payment failed. Please try again.', 'error');
            } finally {
                setSubmitting(false);
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-gray-700">
                Loading...
            </div>
        );
    }

    const normalizedUserStatus = userStatus.toLowerCase();

    if (normalizedUserStatus !== 'approved' && normalizedUserStatus !== 'registered') {
        return null;
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

            <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-[#6b006b] px-6 py-4 border-b border-[#5a005a]">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Fee Payment Details
                        </h2>
                    </div>

                    <div className="p-6">
                        {normalizedUserStatus === 'registered' ? (
                            <div className="text-center py-10 bg-green-50 rounded-lg border border-green-200">
                                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-4 text-xl font-medium text-green-900">Registration Complete</h3>
                                <p className="mt-2 text-green-600">Your payment has been recorded and your registration is successfully done.</p>
                                <div className="mt-6">
                                    <Link to="/applicant/dashboard" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                                        Go to Dashboard
                                    </Link>
                                </div>
                            </div>
                        ) : feeData ? (
                            <>
                                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                Please review the fee breakdown below. Payment is required to confirm your admission.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden border rounded-lg mb-6">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fee Head
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount (₹)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {feeData.details.map((detail, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {detail.head_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        {parseFloat(detail.amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-100 font-bold">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Total Payable Amount
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    ₹{parseFloat(feeData.total_amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {!showPaymentOptions ? (
                                    <div className="flex justify-end gap-4">
                                        <button
                                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded shadow-sm transition"
                                            onClick={() => navigate('/applicant/dashboard')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded shadow-sm transition flex items-center"
                                            onClick={() => setShowPaymentOptions(true)}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            Pay Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div 
                                                className={`cursor-pointer p-4 border rounded-lg flex items-center transition ${paymentMethod === 'gateway' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300 bg-white hover:border-green-300'}`}
                                                onClick={() => setPaymentMethod('gateway')}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">Online Payment Gateway</p>
                                                    <p className="text-xs text-gray-500">Pay via Credit/Debit Card, UPI, Netbanking</p>
                                                </div>
                                            </div>

                                            <div 
                                                className={`cursor-pointer p-4 border rounded-lg flex items-center transition ${paymentMethod === 'bank_transfer' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300 bg-white hover:border-green-300'}`}
                                                onClick={() => setPaymentMethod('bank_transfer')}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">Bank Transfer (NEFT/RTGS)</p>
                                                    <p className="text-xs text-gray-500">Direct transfer to college bank account</p>
                                                </div>
                                            </div>
                                        </div>

                                        {paymentMethod === 'gateway' && (
                                            <div className="p-4 bg-white rounded border border-gray-200">
                                                <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Select a Payment Gateway</h4>
                                                
                                                {loadingGateways ? (
                                                    <div className="text-center py-4">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                                        <p className="text-gray-500 text-sm mt-2">Loading available gateways...</p>
                                                    </div>
                                                ) : gateways.length === 0 ? (
                                                    <div className="text-center py-4 text-red-500 bg-red-50 rounded border border-red-100">
                                                        <p>No active payment gateways found.</p>
                                                        <p className="text-xs mt-1">Please contact the administration or try Bank Transfer.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                        {gateways.map((gw) => (
                                                            <div
                                                                key={gw.id}
                                                                onClick={() => setSelectedGatewayId(gw.id)}
                                                                className={`cursor-pointer p-4 border rounded-lg flex items-center transition relative ${
                                                                    selectedGatewayId === gw.id
                                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                                                }`}
                                                            >
                                                                <div className="w-10 h-10 rounded bg-white border border-gray-100 flex items-center justify-center mr-3 p-1">
                                                                    {gw.icon ? (
                                                                        <img src={gw.icon} alt={gw.name} className="max-w-full max-h-full object-contain" />
                                                                    ) : (
                                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800 text-sm">{gw.name}</p>
                                                                </div>
                                                                {selectedGatewayId === gw.id && (
                                                                    <div className="absolute top-2 right-2 text-blue-500">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="text-center pt-2">
                                                    <button
                                                        onClick={handleGatewayPayment}
                                                        disabled={submitting || !selectedGatewayId}
                                                        className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            selectedGatewayId ? `Pay with ${gateways.find(g => g.id === selectedGatewayId)?.name || 'Gateway'}` : 'Proceed to Pay'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod === 'bank_transfer' && (
                                            <div className="bg-white p-4 rounded border border-gray-200">
                                                <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Enter Bank Transfer Details</h4>
                                                
                                                {collegeBankDetails && (
                                                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                                        <h5 className="font-semibold text-yellow-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                            </svg>
                                                            Bank Account Details for Transfer
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                                            {collegeBankDetails.account_name && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Beneficiary Name</span>
                                                                    <span className="font-bold text-gray-900">{collegeBankDetails.account_name}</span>
                                                                </div>
                                                            )}
                                                            {collegeBankDetails.bank_name && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Bank Name</span>
                                                                    <span className="font-bold text-gray-900">{collegeBankDetails.bank_name}</span>
                                                                </div>
                                                            )}
                                                            {collegeBankDetails.account_number && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Account Number</span>
                                                                    <span className="font-bold text-gray-900 tracking-wide">{collegeBankDetails.account_number}</span>
                                                                </div>
                                                            )}
                                                            {collegeBankDetails.ifsc_code && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wider">IFSC Code</span>
                                                                    <span className="font-bold text-gray-900 tracking-wide">{collegeBankDetails.ifsc_code}</span>
                                                                </div>
                                                            )}
                                                            {collegeBankDetails.branch_name && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Branch</span>
                                                                    <span className="font-bold text-gray-900">{collegeBankDetails.branch_name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 text-xs text-yellow-800 bg-yellow-100/50 p-2.5 rounded border border-yellow-100">
                                                            <p>
                                                                <strong>Note:</strong> Please transfer the exact amount of <span className="font-bold text-black">₹{parseFloat(feeData.total_amount).toFixed(2)}</span> to the above account using NEFT/RTGS/IMPS/UPI and upload the transaction proof below.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <form onSubmit={handleBankTransferSubmit} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Bank Name (Sender's Bank)</label>
                                                        <input 
                                                            type="text" 
                                                            required
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                            value={bankDetails.bank_name}
                                                            onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                                                            placeholder="e.g. SBI, HDFC, etc."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Transaction ID / UTR No.</label>
                                                            <input 
                                                                type="text" 
                                                                required
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                                value={bankDetails.transaction_id}
                                                                onChange={(e) => setBankDetails({...bankDetails, transaction_id: e.target.value})}
                                                                placeholder="Enter Transaction ID"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
                                                            <input 
                                                                type="date" 
                                                                required
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                                value={bankDetails.transaction_date}
                                                                onChange={(e) => setBankDetails({...bankDetails, transaction_date: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Upload Payment Proof</label>
                                                        <input 
                                                            type="file" 
                                                            ref={fileInputRef}
                                                            required
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            className="mt-1 block w-full text-sm text-gray-500
                                                                file:mr-4 file:py-2 file:px-4
                                                                file:rounded-full file:border-0
                                                                file:text-sm file:font-semibold
                                                                file:bg-purple-50 file:text-purple-700
                                                                hover:file:bg-purple-100"
                                                            onChange={handleFileChange}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Allowed formats: JPG, PNG, PDF. Max size: 2MB</p>
                                                    </div>
                                                    
                                                    <div className="pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={submitting}
                                                            className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
                                                        >
                                                            {submitting ? 'Submitting...' : 'Submit Payment Details'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 text-right">
                                            <button 
                                                className="text-sm text-gray-500 underline hover:text-gray-700"
                                                onClick={() => {
                                                    setShowPaymentOptions(false);
                                                    setPaymentMethod(null);
                                                }}
                                            >
                                                Back to Fee Summary
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No fee details available for your admission category.</p>
                            </div>
                        )}
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

export default FeePage;
