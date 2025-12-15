'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registrationAPI } from '@/lib/api';
import { logout } from '@/lib/auth';
import CouponInput from './CouponInput';
import SimilarNamesList from './SimilarNamesList';
import SimilarMobilesList from './SimilarMobilesList';
import Toast from './Toast';

interface RegistrationFormProps {
  username: string;
  role: 'user' | 'admin';
}

export default function RegistrationForm({ username, role }: RegistrationFormProps) {
  const router = useRouter();
  const [couponNo, setCouponNo] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCouponValid) {
      setToast({ message: 'Please enter a valid coupon number', type: 'error' });
      return;
    }

    if (!/^[0-9]{10}$/.test(mobileNo)) {
      setToast({ message: 'Mobile number must be exactly 10 digits', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const result = await registrationAPI.createRegistration({
        couponNo,
        name: name.trim(),
        mobileNo: mobileNo.trim(),
      });

      setToast({
        message: `Registration successful! Coupon: ${result.registration.couponNo}`,
        type: 'success',
      });

      // Reset form
      setCouponNo('');
      setName('');
      setMobileNo('');
      setIsCouponValid(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isFormValid = isCouponValid && name.trim().length > 0 && /^[0-9]{10}$/.test(mobileNo);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Registration System</h1>
                <p className="text-sm text-gray-600">Logged in as: {username} ({role})</p>
              </div>
              <div className="flex gap-3">
                {role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">New Registration</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Coupon Number */}
                  <CouponInput
                    value={couponNo}
                    onChange={setCouponNo}
                    onValidationChange={setIsCouponValid}
                  />

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                      placeholder="Enter attendee name"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mobileNo"
                      type="tel"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      pattern="[0-9]{10}"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        mobileNo && !/^[0-9]{10}$/.test(mobileNo)
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {mobileNo && !/^[0-9]{10}$/.test(mobileNo) && (
                      <p className="mt-1 text-sm text-red-600">Must be exactly 10 digits</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      'Register Attendee'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Similar Search Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <SimilarNamesList searchQuery={name} />
              <SimilarMobilesList searchQuery={mobileNo} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
