import React from 'react';

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea ref={ref} className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none resize-none ${className}`} {...props} />
));
Textarea.displayName = 'Textarea';
