
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Dashboard App</span>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium">
                  Home
                </Link>
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === 'manager' && (
                      <Link to="/manager" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        Manager Dashboard
                      </Link>
                    )}
                    {user?.role === 'customer' && (
                      <Link to="/customer" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        Customer Dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                      Login
                    </Link>
                    <Link to="/register" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-semibold text-gray-900">Welcome to the Dashboard Application</h1>
                <p className="mt-3 text-gray-600">
                  This is a multi-role application with different dashboards for admin, manager, and customer roles.
                </p>
                
                {isAuthenticated ? (
                  <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-900">You are logged in as: {user?.role}</h2>
                    <p className="mt-2 text-gray-600">
                      Navigate to your dashboard using the navigation links above.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600">
                      Please log in to access your dashboard.
                    </p>
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
