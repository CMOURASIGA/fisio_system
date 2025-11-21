import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const oauthError = params.get('error') || params.get('error_description');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Entrar no Fisio System</h1>
        <p className="text-sm text-gray-600 mb-6">Faça login com sua conta Google para continuar.</p>

        {oauthError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            Erro de login: {oauthError}
          </div>
        )}

        <button
          onClick={() => signInWithGoogle()}
          className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm"
          disabled={loading}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="currentColor" d="M21.6 12.23c0-.78-.07-1.53-.21-2.25H12v4.26h5.73c-.25 1.37-1.02 2.53-2.18 3.31v2.75h3.54c2.07-1.91 3.29-4.73 3.29-8.07z"/>
            <path fill="currentColor" d="M12 22c2.97 0 5.46-1.02 7.28-2.77l-3.54-2.75c-.98.66-2.23 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.12v2.86C3.94 19.92 7.73 22 12 22z"/>
            <path fill="currentColor" d="M5.83 13.98A7.005 7.005 0 0 1 5 12c0-.66.1-1.29.28-1.88V7.26H2.12A10 10 0 0 0 2 12c0 1.6.36 3.12 1.01 4.48l2.82-2.5z"/>
            <path fill="currentColor" d="M12 6.5c1.62 0 3.09.56 4.24 1.65l3.19-3.19C17.45 2.17 14.97 1 12 1 7.73 1 3.94 3.08 2.12 6.26l3.16 2.36C6.7 8.44 9.13 6.5 12 6.5z"/>
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
