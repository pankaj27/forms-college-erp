import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import DynamicForm from './components/DynamicForm';
import '../css/app.css';

// Simple check to ensure we are running in the browser
if (typeof window !== 'undefined') {
    // Check for main app root
    const rootElement = document.getElementById('app');
    
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('Main React app mounted successfully.');
    }
}
