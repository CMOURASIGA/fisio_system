import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Quick fix: Supabase OAuth can sometimes redirect with an error string as the pathname
// e.g. /error=server_error&error_code=... which React Router treats as a route and shows blank page.
// Normalize that into a query on /login so the app can show a friendly message.
if (window.location.pathname && window.location.pathname.startsWith('/error=')) {
  const rest = window.location.pathname.slice(1); // remove leading /
  // convert to search params and push to /login
  try {
    const newUrl = `${window.location.origin}/#/login?${rest}`;
    history.replaceState(null, '', newUrl);
  } catch (e) {
    // ignore
  }
}

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);