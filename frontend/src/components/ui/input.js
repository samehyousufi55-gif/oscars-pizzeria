import React from 'react';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none ${className}`} {...props} />
));
Input.displayName = 'Input';
