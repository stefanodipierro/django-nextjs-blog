import React from 'react';

export interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  imageUrl?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, url: customUrl, description, imageUrl }) => {
  // Current page URL or custom URL if provided
  const url = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : encodedTitle;
  const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : '';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}${encodedImage ? `&image=${encodedImage}` : ''}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}${encodedImage ? `&media=${encodedImage}` : ''}`,
  };

  const openWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-4">
      <h3 className="w-full text-sm text-gray-600 dark:text-gray-400 mb-2">Share this post:</h3>
      <button
        onClick={() => openWindow(shareLinks.twitter)}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-[#1DA1F2] text-white rounded hover:bg-opacity-90 text-sm"
        aria-label="Share on Twitter"
      >
        Twitter
      </button>
      <button
        onClick={() => openWindow(shareLinks.facebook)}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-[#3b5998] text-white rounded hover:bg-opacity-90 text-sm"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>
      <button
        onClick={() => openWindow(shareLinks.linkedin)}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-[#0072b1] text-white rounded hover:bg-opacity-90 text-sm"
        aria-label="Share on LinkedIn"
      >
        LinkedIn
      </button>
      {imageUrl && (
        <button
          onClick={() => openWindow(shareLinks.pinterest)}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-[#BD081C] text-white rounded hover:bg-opacity-90 text-sm"
          aria-label="Share on Pinterest"
        >
          Pinterest
        </button>
      )}
    </div>
  );
};

export default SocialShare; 