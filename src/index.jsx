import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // If you have any global styles

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
