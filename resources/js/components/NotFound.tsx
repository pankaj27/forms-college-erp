import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        // Attempt to close the window
        // Note: This may not work in all browsers if the window wasn't opened by a script
        window.close();
        
        // Fallback or user feedback if window.close() is blocked
        if (!window.closed) {
             // In many modern browsers, you can't close a tab that wasn't opened by window.open()
             // We can inform the user or just redirect them to a safe page like Google or blank
             alert("Browser security prevented this tab from closing automatically. Please close it manually.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Illustration/Text */}
                <div className="relative">
                    <h1 className="text-9xl font-extrabold text-gray-200 tracking-widest">404</h1>
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded shadow-lg transform -rotate-12">
                            Page Not Found
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Oops! Lost in Space?
                    </h2>
                    <p className="text-lg text-gray-600">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go Home
                    </button>

                    <button
                        onClick={handleClose}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Page
                    </button>
                </div>
                
                <div className="mt-12 text-sm text-gray-400">
                    <p>Error Code: 404</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
