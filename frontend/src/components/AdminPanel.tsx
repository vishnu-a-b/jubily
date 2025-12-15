'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registrationAPI } from '@/lib/api';
import { logout } from '@/lib/auth';
import Toast from './Toast';

interface AdminPanelProps {
  username: string;
}

interface Registration {
  _id: string;
  couponNo: string;
  name: string;
  mobileNo: string;
  createdAt: string;
  deletedAt?: string;
  deletedBy?: string;
}

export default function AdminPanel({ username }: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [activeTab, page]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'active') {
        data = await registrationAPI.getAllRegistrations(page, 50);
      } else {
        data = await registrationAPI.getDeletedRegistrations(page, 50);
      }

      setRegistrations(data.registrations);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Load error:', error);
      setToast({ message: 'Failed to load registrations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponNo: string) => {
    if (!confirm(`Are you sure you want to delete registration with coupon ${couponNo}?`)) {
      return;
    }

    try {
      await registrationAPI.deleteRegistration(couponNo);
      setToast({ message: 'Registration deleted successfully', type: 'success' });
      loadRegistrations();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete registration';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.couponNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.mobileNo.includes(searchTerm)
  );

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
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Logged in as: {username} (admin)</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Register Attendee
                </button>
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
          <div className="bg-white rounded-lg shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => {
                    setActiveTab('active');
                    setPage(1);
                  }}
                  className={`px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'active'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active Registrations ({activeTab === 'active' ? total : ''})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('deleted');
                    setPage(1);
                  }}
                  className={`px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'deleted'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Deleted Registrations ({activeTab === 'deleted' ? total : ''})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search by name, coupon, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No registrations found
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupon No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === 'active' ? 'Registered At' : 'Deleted At'}
                      </th>
                      {activeTab === 'deleted' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deleted By
                        </th>
                      )}
                      {activeTab === 'active' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {reg.couponNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {reg.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {reg.mobileNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(activeTab === 'active' ? reg.createdAt : reg.deletedAt!).toLocaleString()}
                        </td>
                        {activeTab === 'deleted' && (
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {reg.deletedBy}
                          </td>
                        )}
                        {activeTab === 'active' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(reg.couponNo)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
