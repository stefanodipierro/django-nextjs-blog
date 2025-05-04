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
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed.');
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md text-center">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Subscribe to our newsletter
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-2">
        <input
          type="email"
          required
          placeholder="Your email address"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md flex-1 focus:outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
      )}
    </div>
  );
};

export default NewsletterForm; 