'use client';

import { useEffect, useState } from 'react';
import { registrationAPI } from '@/lib/api';

interface SimilarNamesListProps {
  searchQuery: string;
}

interface Registration {
  _id: string;
  name: string;
  mobileNo: string;
  couponNo: string;
}

export default function SimilarNamesList({ searchQuery }: SimilarNamesListProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Registration[]>([]);

  useEffect(() => {
    const searchNames = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const data = await registrationAPI.searchSimilarNames(searchQuery);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search by 300ms
    const debounceTimer = setTimeout(searchNames, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Similar Names
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          {searchQuery.trim().length < 2 ? 'Start typing to search...' : 'No similar names found'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((registration) => (
            <div
              key={registration._id}
              className="bg-white p-3 rounded border border-blue-200 hover:border-blue-400 transition"
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
