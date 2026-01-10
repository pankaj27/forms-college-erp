import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AdmissionForm, AdmissionFormField, AdmissionFormSection } from '../types/FormTypes';

const DynamicForm: React.FC = () => {
    const { shortCode } = useParams<{ shortCode: string }>();
    const [form, setForm] = useState<AdmissionForm | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await axios.get(`/api/forms/${shortCode}`);
                setForm(response.data);
            } catch (err) {
                setError('Failed to load form. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (shortCode) {
            fetchForm();
        } else {
            setError('Form code not found.');
            setLoading(false);
        }
    }, [shortCode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name.endsWith('[]')) {
                 const fieldName = name.slice(0, -2);
                 const currentValues = (formData[fieldName] as string[]) || [];
                 if (checked) {
                     setFormData({ ...formData, [fieldName]: [...currentValues, value] });
                 } else {
                     setFormData({ ...formData, [fieldName]: currentValues.filter(v => v !== value) });
                 }
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else if (type === 'file') {
             const files = (e.target as HTMLInputElement).files;
             if (files && files.length > 0) {
                 setFormData({ ...formData, [name]: files[0] });
             }
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
        // Clear error for this field if it exists
        if (validationErrors[name]) {
             const newErrors = { ...validationErrors };
             delete newErrors[name];
             setValidationErrors(newErrors);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, required } = e.target;
        
        // Simple required validation on blur
        // Note: For complex validation, we might want to use the field definition
        if (required && (!value || (Array.isArray(value) && value.length === 0))) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: [`This field is required.`]
            }));
        }
    };

    const validateCurrentStep = (): boolean => {
        if (!form) return false;
        
        const currentSection = form.sections[currentStep];
        const errors: Record<string, string[]> = {};
        let isValid = true;

        currentSection.fields.forEach(field => {
            if (field.is_required) {
                const val = formData[field.name];
                if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                    errors[field.name] = [`${field.label} is required.`];
                    isValid = false;
                }
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;

        setSubmitting(true);
        setValidationErrors({});
        setSuccessMessage(null);
        setError(null);

        try {
            // Use FormData for file uploads support
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (Array.isArray(value)) {
                    value.forEach(v => data.append(`${key}[]`, v));
                } else {
                    data.append(key, value);
                }
            });

            const response = await axios.post(`/api/forms/${shortCode}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                setFormData({}); // Reset form
                setCurrentStep(0);
                window.scrollTo(0, 0);
            }
        } catch (err: any) {
            if (err.response && err.response.status === 422) {
                setValidationErrors(err.response.data.errors);
            } else {
                setError('An error occurred while submitting the form. Please try again.');
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getColSpanClass = (width: number) => {
        switch (width) {
            case 1: return 'md:col-span-1';
            case 2: return 'md:col-span-2';
            case 3: return 'md:col-span-3';
            case 4: return 'md:col-span-4';
            case 5: return 'md:col-span-5';
            case 6: return 'md:col-span-6';
            case 7: return 'md:col-span-7';
            case 8: return 'md:col-span-8';
            case 9: return 'md:col-span-9';
            case 10: return 'md:col-span-10';
            case 11: return 'md:col-span-11';
            default: return 'md:col-span-12';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="container mx-auto px-4 py-10 max-w-7xl">
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 animate-fade-in">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-fade-in">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{form.title}</h1>
                    {form.description && (
                        <p className="text-blue-100 mt-2 text-lg opacity-90">{form.description}</p>
                    )}
                </div>

                {/* Step Indicator */}
                {form.sections.length > 1 && (
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                            {form.sections.map((section, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center group cursor-default">
                                    <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 
                                            ${idx === currentStep 
                                                ? 'bg-blue-600 border-blue-200 text-white scale-110 shadow-lg' 
                                                : idx < currentStep 
                                                    ? 'bg-green-500 border-green-200 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-400'
                                            }`}
                                    >
                                        {idx < currentStep ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${idx === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                                        Step {idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Current Section */}
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 border-l-4 border-blue-500 pl-4">
                                {form.sections[currentStep].title}
                            </h2>
                            {form.sections[currentStep].description && (
                                <p className="text-gray-500 mb-6 pl-4 text-sm italic">{form.sections[currentStep].description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                                {form.sections[currentStep].fields.map((field: AdmissionFormField) => {
                                    const colSpan = getColSpanClass(field.grid_width);
                                    
                                    return (
                                        <div key={field.id} className={`${colSpan}`}>
                                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-1">
                                                {field.label}
                                                {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            <div className="relative">
                                                <FieldInput 
                                                    field={field} 
                                                    value={formData[field.name]} 
                                                    onChange={handleInputChange} 
                                                    onBlur={handleBlur}
                                                    hasError={!!validationErrors[field.name]}
                                                />
                                            </div>

                                            {validationErrors[field.name] && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {validationErrors[field.name][0]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentStep === 0 || submitting}
                                className={`flex items-center px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${currentStep === 0 ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Previous
                            </button>

                            {currentStep < form.sections.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5"
                                >
                                    Next Step
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className={`flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 ${submitting ? 'opacity-75 cursor-wait' : ''}`}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} College Management Software. All rights reserved.
            </div>
        </div>
    );
};

interface FieldInputProps {
    field: AdmissionFormField;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    hasError: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange, onBlur, hasError }) => {
    // Parse options if string
    let options: string[] = [];
    if (typeof field.options === 'string') {
        try {
            options = JSON.parse(field.options);
        } catch (e) {
            options = [];
        }
    } else if (Array.isArray(field.options)) {
        options = field.options;
    }

    const baseInputClass = `w-full rounded-lg shadow-sm sm:text-sm border p-3 transition-all duration-200 ease-in-out ${
        hasError 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 text-red-900 placeholder-red-300' 
            : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500'
    }`;

    switch (field.field_type) {
        case 'textarea':
            return (
                <textarea
                    name={field.name}
                    id={field.name}
                    rows={4}
                    className={baseInputClass}
                    placeholder={field.placeholder}
                    required={field.is_required}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            );
        
        case 'select':
            return (
                <select
                    name={field.name}
                    id={field.name}
                    className={`${baseInputClass} appearance-none`}
                    required={field.is_required}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                    <option value="">Select {field.label}...</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                    ))}
                </select>
            );

        case 'radio':
            return (
                <div className="mt-2 space-y-3">
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center group cursor-pointer">
                            <input
                                id={`${field.name}_${idx}`}
                                name={field.name}
                                type="radio"
                                value={opt}
                                className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform transform group-hover:scale-110"
                                required={field.is_required}
                                checked={value === opt}
                                onChange={onChange}
                                onBlur={onBlur}
                            />
                            <label htmlFor={`${field.name}_${idx}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer group-hover:text-blue-600 transition-colors">
                                {opt}
                            </label>
                        </div>
                    ))}
                </div>
            );
        
        case 'checkbox':
             // If options exist, it's a checkbox group
             if (options.length > 0) {
                 return (
                    <div className="mt-2 space-y-3">
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center group cursor-pointer">
                                <input
                                    id={`${field.name}_${idx}`}
                                    name={`${field.name}[]`} // Use array notation for backend
                                    type="checkbox"
                                    value={opt}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform transform group-hover:scale-110"
                                    checked={Array.isArray(value) && value.includes(opt)}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                />
                                <label htmlFor={`${field.name}_${idx}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer group-hover:text-blue-600 transition-colors">
                                    {opt}
                                </label>
                            </div>
                        ))}
                    </div>
                 );
             } else {
                 return (
                    <div className="mt-1 flex items-center group cursor-pointer">
                        <input
                            id={field.name}
                            name={field.name}
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform transform group-hover:scale-110"
                            checked={!!value}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                        <label htmlFor={field.name} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer group-hover:text-blue-600 transition-colors">
                            {field.label}
                        </label>
                    </div>
                 );
             }

        case 'file':
            return (
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer group ${hasError ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                    <div className="space-y-1 text-center">
                        <svg className={`mx-auto h-12 w-12 transition-colors ${hasError ? 'text-red-400' : 'text-gray-400 group-hover:text-blue-500'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor={field.name} className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none ${hasError ? 'text-red-600 hover:text-red-500' : 'text-blue-600 hover:text-blue-500'}`}>
                                <span>Upload a file</span>
                                <input id={field.name} name={field.name} type="file" className="sr-only" onChange={onChange} onBlur={onBlur} required={field.is_required} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className={`text-xs ${hasError ? 'text-red-500' : 'text-gray-500'}`}>
                            {value ? `Selected: ${value.name}` : 'PNG, JPG, PDF up to 10MB'}
                        </p>
                    </div>
                </div>
            );

        default: // text, number, date, email, etc.
            return (
                <input
                    type={field.field_type}
                    name={field.name}
                    id={field.name}
                    className={baseInputClass}
                    placeholder={field.placeholder}
                    required={field.is_required}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            );
    }
}

export default DynamicForm;
