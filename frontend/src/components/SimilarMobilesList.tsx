'use client';

import { useEffect, useState } from 'react';
import { registrationAPI } from '@/lib/api';

interface SimilarMobilesListProps {
  searchQuery: string;
}

interface Registration {
  _id: string;
  name: string;
  mobileNo: string;
  couponNo: string;
}

export default function SimilarMobilesList({ searchQuery }: SimilarMobilesListProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Registration[]>([]);

  useEffect(() => {
    const searchMobiles = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const data = await registrationAPI.searchSimilarMobiles(searchQuery);
        setResults(data);
      } catch (error) {
        console.error('Mobile search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search by 300ms
    const debounceTimer = setTimeout(searchMobiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-900 mb-3 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        Similar Mobile Numbers
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-green-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          {searchQuery.trim().length < 2 ? 'Start typing to search...' : 'No similar mobile numbers found'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((registration) => (
            <div
              key={registration._id}
              className="bg-white p-3 rounded border border-green-200 hover:border-green-400 transition"
            >
              <p className="font-medium text-gray-900">{registration.name}</p>
              <p className="text-sm text-gray-600">Mobile: {registration.mobileNo}</p>
              <p className="text-sm text-gray-600">Coupon: {registration.couponNo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
