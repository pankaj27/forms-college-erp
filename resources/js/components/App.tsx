import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DynamicForm from './DynamicForm';
import NotFound from './NotFound';

const Home = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center transform transition-all hover:scale-105 duration-300">
            <div className="mb-6 flex justify-center">
                <svg 
                    className="w-24 h-24 text-blue-500 animate-bounce" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                    />
                </svg>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Under Construction
            </h1>
            
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                We're building something extraordinary for the <span className="font-semibold text-blue-600">Nursing College ERP</span>. 
                Check back soon!
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>

            <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Nursing College ERP. All rights reserved.
            </div>
        </div>
    </div>
);

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/forms/:shortCode" element={<DynamicForm />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}
