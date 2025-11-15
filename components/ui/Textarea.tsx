
import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, error, ...props }, ref) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-premium-gray-700 mb-1">{label}</label>
      <textarea
        id={id}
        ref={ref}
        rows={4}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-premium-gray-300'} rounded-md shadow-sm placeholder-premium-gray-400 focus:outline-none focus:ring-selim-dark-blue focus:border-selim-dark-blue sm:text-sm transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
