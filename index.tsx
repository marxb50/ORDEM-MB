
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'lucide-react'; // This is just to ensure it's seen by bundlers. In this setup, it works due to components importing it.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
