
import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, id, error, children, ...props }, ref) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-premium-gray-700 mb-1">{label}</label>
      <select
        id={id}
        ref={ref}
        className={`block w-full pl-3 pr-10 py-2 text-base border ${error ? 'border-red-500' : 'border-premium-gray-300'} focus:outline-none focus:ring-selim-dark-blue focus:border-selim-dark-blue sm:text-sm rounded-md transition-all`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
