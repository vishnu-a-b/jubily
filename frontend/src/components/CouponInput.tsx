'use client';

import { useState, useEffect } from 'react';
import { registrationAPI } from '@/lib/api';

interface CouponInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function CouponInput({ value, onChange, onValidationChange }: CouponInputProps) {
  const [checking, setChecking] = useState(false);
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
    existingRegistration?: any;
  }>({ status: 'idle' });

  useEffect(() => {
    const checkCoupon = async () => {
      if (!value || value.trim().length === 0) {
        setValidationState({ status: 'idle' });
        onValidationChange(false);
        return;
      }

      // Validate format
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        setValidationState({
          status: 'invalid',
          message: 'Only letters and numbers allowed',
        });
        onValidationChange(false);
        return;
      }

      setChecking(true);

      try {
        const result = await registrationAPI.checkCoupon(value);

        if (result.available) {
          setValidationState({ status: 'valid', message: 'Coupon available' });
          onValidationChange(true);
        } else {
          setValidationState({
            status: 'invalid',
            message: `Already registered to ${result.existingRegistration.name} - ${result.existingRegistration.mobileNo}`,
            existingRegistration: result.existingRegistration,
          });
          onValidationChange(false);
        }
      } catch (error) {
        setValidationState({
          status: 'invalid',
          message: 'Error checking coupon',
        });
        onValidationChange(false);
      } finally {
        setChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkCoupon, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, onValidationChange]);

  return (
    <div>
      <label htmlFor="couponNo" className="block text-sm font-medium text-gray-700 mb-2">
        Coupon Number <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id="couponNo"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          required
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
            validationState.status === 'valid'
              ? 'border-green-500 focus:ring-green-500'
              : validationState.status === 'invalid'
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          }`}
          placeholder="Enter coupon number"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {checking ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : validationState.status === 'valid' ? (
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : validationState.status === 'invalid' ? (
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : null}
        </div>
      </div>
      {validationState.message && (
        <p className={`mt-1 text-sm ${validationState.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
          {validationState.message}
        </p>
      )}
    </div>
  );
}
