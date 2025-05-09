import React, { useState } from 'react';
import { subscribe } from '../lib/api';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await subscribe(email);
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('Subscription failed.');
      }
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md text-center">
      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-md sm:max-w-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 text-left">
            Subscribe to our newsletter
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm; 