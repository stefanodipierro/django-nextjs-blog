import React from 'react';

interface SocialShareProps {
  title: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title }) => {
  // Current page URL
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`,
  };

  const openWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-4 mt-8">
      <button
        onClick={() => openWindow(shareLinks.twitter)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Twitter
      </button>
      <button
        onClick={() => openWindow(shareLinks.facebook)}
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
      >
        Facebook
      </button>
      <button
        onClick={() => openWindow(shareLinks.linkedin)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        LinkedIn
      </button>
    </div>
  );
};

export default SocialShare; 