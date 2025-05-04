import React from 'react';
import NewsletterForm from './NewsletterForm';

const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
    <div className="container mx-auto px-4">
      <NewsletterForm />
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Blog Template. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer; 