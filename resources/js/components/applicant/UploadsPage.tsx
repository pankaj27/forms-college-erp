import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface UploadedFile {
    id: number;
    original_name: string;
    file_size: number;
    uploaded_at: string;
    url: string;
}

interface UploadsMap {
    [key: string]: UploadedFile;
}

const UploadsPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [uploads, setUploads] = useState<UploadsMap>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const steps = [
        { key: 'personal', label: 'Personal', number: 1, path: '/applicant/personal' },
        { key: 'programme', label: 'Programme', number: 2, path: '/applicant/programme' },
        { key: 'qualification', label: 'Qualification', number: 3, path: '/applicant/qualification' },
        { key: 'correspondence', label: 'Communication Address Details', number: 4, path: '/applicant/correspondence' },
        { key: 'uploads', label: 'Upload', number: 5, path: '/applicant/uploads' },
        { key: 'preview', label: 'Preview', number: 6, path: '/applicant/preview' },
        { key: 'fee', label: 'Fee', number: 7, path: '/applicant/fee' },
    ] as const;

    const currentStepKey = 'uploads';

    const documentTypes = [
        { key: 'photo', label: 'PHOTO', minSize: 10, maxSize: 100, formats: ['.jpg', '.jpeg'], description: 'Min File Size: 10KB, Max File Size: 100 KB\nAccepted formats .jpg .jpeg' },
        { key: 'signature', label: 'SIGNATURE', minSize: 10, maxSize: 100, formats: ['.jpg', '.jpeg'], description: 'Min File Size: 10KB, Max File Size: 100 KB\nAccepted formats .jpg .jpeg' },
        { key: 'matriculation', label: 'MATRICULATION MARKSHEET OR CERTIFICATE', minSize: 10, maxSize: 300, formats: ['.jpg', '.jpeg', '.pdf'], description: 'Min File Size: 10KB, Max File Size: 300 KB\nAccepted formats .jpg .jpeg .pdf' },
        { key: '10plus2', label: '10+2 MARKSHEET / CERTIFICATE', minSize: 10, maxSize: 300, formats: ['.jpg', '.jpeg', '.pdf'], description: 'Min File Size: 10KB, Max File Size: 300 KB\nAccepted formats .jpg .jpeg .pdf' },
        { key: 'graduation_marksheet', label: 'MARKSHEET OF GRADUATION', minSize: 10, maxSize: 300, formats: ['.jpg', '.jpeg', '.pdf'], description: 'Min File Size: 10KB, Max File Size: 300 KB\nAccepted formats .jpg .jpeg .pdf' },
        { key: 'graduation_degree', label: 'DEGREE OR PROVISIONAL CERTIFICATE OF GRADUATION', minSize: 10, maxSize: 300, formats: ['.jpg', '.jpeg', '.pdf'], description: 'Min File Size: 10KB, Max File Size: 300 KB\nAccepted formats .jpg .jpeg .pdf' },
        ...Array.from({ length: 8 }, (_, i) => ({
            key: `others${i + 1}`,
            label: `OTHERS${i + 1}`,
            minSize: 10,
            maxSize: 300,
            formats: ['.jpg', '.jpeg', '.pdf'],
            description: 'Min File Size: 10KB, Max File Size: 300 KB\nAccepted formats .jpg .jpeg .pdf'
        }))
    ];

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [userRes, uploadsRes] = await Promise.all([
                    axios.get('/api/applicants/me'),
                    axios.get('/api/applicants/uploads')
                ]);

                if (userRes.data?.authenticated && userRes.data.user) {
                    const user = userRes.data.user;
                    setUserProgress(user.progress);
                    
                    // Check if application is submitted or approved
                    if (user.status === 'submitted' || user.status === 'approved') {
                        navigate('/applicant/preview');
                        return;
                    }
                }
                
                if (uploadsRes.data?.success) {
                    setUploads(uploadsRes.data.data);
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

    const handleFileSelect = (key: string) => {
        fileInputRefs.current[key]?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, docType: typeof documentTypes[0]) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset errors
        setErrors(prev => ({ ...prev, [docType.key]: '' }));

        // Validate size
        const sizeKB = file.size / 1024;
        if (sizeKB < docType.minSize || sizeKB > docType.maxSize) {
            setErrors(prev => ({ 
                ...prev, 
                [docType.key]: `File size (${sizeKB.toFixed(1)}KB) invalid. Must be between ${docType.minSize}KB and ${docType.maxSize}KB.` 
            }));
            // Clear the input so user can try again
            if (fileInputRefs.current[docType.key]) {
                fileInputRefs.current[docType.key]!.value = '';
            }
            return;
        }

        // Validate type
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!docType.formats.includes(ext)) {
            setErrors(prev => ({ 
                ...prev, 
                [docType.key]: `Invalid file format (${ext}). Accepted: ${docType.formats.join(', ')}` 
            }));
             if (fileInputRefs.current[docType.key]) {
                fileInputRefs.current[docType.key]!.value = '';
            }
            return;
        }

        const formData = new FormData();
        formData.append('document_type', docType.key);
        formData.append('file', file);

        setUploading(docType.key);

        try {
            const response = await axios.post('/api/applicants/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.success) {
                setUploads(prev => ({
                    ...prev,
                    [docType.key]: {
                        id: response.data.data.id,
                        original_name: response.data.data.original_name,
                        file_size: file.size,
                        uploaded_at: new Date().toISOString(),
                        url: response.data.data.url
                    }
                }));
            }
        } catch (error: any) {
            console.error('Upload failed', error);
            setErrors(prev => ({ ...prev, [docType.key]: error.response?.data?.message || 'Upload failed. Please try again.' }));
        } finally {
            setUploading(null);
            // Clear input
            if (fileInputRefs.current[docType.key]) {
                fileInputRefs.current[docType.key]!.value = '';
            }
        }
    };

    const handleDelete = async (docType: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await axios.delete(`/api/applicants/uploads/${docType}`);
            if (response.data?.success) {
                setUploads(prev => {
                    const newUploads = { ...prev };
                    delete newUploads[docType];
                    return newUploads;
                });
                
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                );
            }
        } catch (error: any) {
            console.error('Delete failed', error);
            setErrors(prev => ({ ...prev, [docType]: error.response?.data?.message || 'Delete failed. Please try again.' }));
            Swal.fire(
                'Error!',
                'Failed to delete the file.',
                'error'
            );
        }
    };

    const isImage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png'].includes(ext || '');
    };

    const handleNext = () => {
        if (!uploads['photo'] || !uploads['signature']) {
            Swal.fire({
                title: 'Incomplete Uploads',
                text: 'Please upload both Photo and Signature before proceeding.',
                icon: 'warning',
                confirmButtonColor: '#d33'
            });
            return;
        }
        navigate('/applicant/preview');
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

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
                <div className="bg-[#fff9e6] border border-gray-200 rounded shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {documentTypes.map((doc) => (
                            <div key={doc.key} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">{doc.label}</h3>
                                    <p className="text-xs text-[#0066b3] mt-1 whitespace-pre-line font-medium italic">
                                        {doc.description}
                                    </p>
                                    {errors[doc.key] && (
                                        <p className="text-xs text-red-600 mt-1">{errors[doc.key]}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        ref={(el) => (fileInputRefs.current[doc.key] = el)}
                                        className="hidden"
                                        accept={doc.formats.join(',')}
                                        onChange={(e) => handleFileChange(e, doc)}
                                    />
                                    
                                    {uploads[doc.key] ? (
                                        <div className="flex flex-col items-end gap-2">
                                            {isImage(uploads[doc.key].original_name) && (
                                                <div className="mb-2">
                                                    <img 
                                                        src={uploads[doc.key].url} 
                                                        alt={doc.label} 
                                                        className="w-24 h-24 object-cover border border-gray-300 rounded shadow-sm"
                                                    />
                                                </div>
                                            )}
                                            
                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded border border-green-200">
                                                Uploaded: {uploads[doc.key].original_name}
                                            </span>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={uploads[doc.key].url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                                                >
                                                    View
                                                </a>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleFileSelect(doc.key)}
                                                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition"
                                                >
                                                    Change
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDelete(doc.key)}
                                                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleFileSelect(doc.key)}
                                            disabled={uploading === doc.key}
                                            className={`px-4 py-2 bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-xs font-semibold rounded shadow-sm transition min-w-[100px] ${
                                                uploading === doc.key ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {uploading === doc.key ? 'Uploading...' : 'Select file'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between gap-4 mt-6">
                    <button
                        className="flex-1 px-6 py-3 bg-[#5bc0de] hover:bg-[#46b8da] text-white text-sm font-semibold rounded shadow-sm transition"
                        onClick={() => navigate('/applicant/correspondence')}
                    >
                        Previous
                    </button>
                    <button
                        className="flex-1 px-6 py-3 bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-sm font-semibold rounded shadow-sm transition"
                        onClick={handleNext}
                    >
                        Save & Next
                    </button>
                </div>
            </main>

            <footer className="bg-[#1f2937] text-gray-300 text-xs mt-auto">
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

export default UploadsPage;
