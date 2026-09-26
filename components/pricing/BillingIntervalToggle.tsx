'use client';

import React from 'react';

interface BillingIntervalToggleProps {
  billingInterval: 'monthly' | 'yearly';
  onChange: (interval: 'monthly' | 'yearly') => void;
}

export function BillingIntervalToggle({ billingInterval, onChange }: BillingIntervalToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
      <button
        onClick={() => onChange('monthly')}
        className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
          billingInterval === 'monthly'
            ? 'bg-white text-gray-900 shadow dark:bg-gray-950 dark:text-white'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Bill Monthly
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
          billingInterval === 'yearly'
            ? 'bg-white text-gray-900 shadow dark:bg-gray-950 dark:text-white'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Bill Yearly (Save 20%)
      </button>
    </div>
  );
}
