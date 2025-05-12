import React from 'react';
import NewsletterForm from './NewsletterForm';

const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 mt-2 sticky bottom-0 w-full z-10">
    <div className="container mx-auto px-4">
      <NewsletterForm />
    </div>
  </footer>
);

export default Footer; 