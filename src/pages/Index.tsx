
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth';

const Index = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-20 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          Willkommen bei IntellyWave
        </h1>
        
        <p className="text-xl md:text-2xl text-center mb-12 max-w-3xl">
          Ihre zentrale Plattform für AI-gestützte Recruiting und Talent Management Lösungen
        </p>
        
        <div className="w-full max-w-md mx-auto space-y-6">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to="/login"
                className="flex justify-center w-full py-3 px-4 bg-white hover:bg-blue-50 text-blue-800 font-semibold rounded-lg transition shadow-lg"
              >
                Anmelden
              </Link>
              
              <Link
                to="/register"
                className="flex justify-center w-full py-3 px-4 bg-transparent hover:bg-blue-800 border-2 border-white text-white font-semibold rounded-lg transition"
              >
                Registrieren
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex justify-center w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  Zum Admin Dashboard
                </Link>
              )}
              
              {isManager && (
                <Link
                  to="/manager/dashboard"
                  className="flex justify-center w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  Zum Manager Dashboard
                </Link>
              )}
              
              {isCustomer && (
                <Link
                  to="/customer/dashboard"
                  className="flex justify-center w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  Zum Kunden Dashboard
                </Link>
              )}
              
              {!isAdmin && !isManager && !isCustomer && (
                <Link
                  to="/customer/dashboard"
                  className="flex justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  Zum Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
