import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import '../css/app.css';

// Simple check to ensure we are running in the browser
if (typeof window !== 'undefined') {
    const rootElement = document.getElementById('app');
    
    if (rootElement) {
        // Create root and render
        const root = createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('React app mounted successfully.');
    } else {
        console.error('Failed to find the root element #app');
    }
}
