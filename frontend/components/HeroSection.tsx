import React from 'react';
import Image from 'next/image';
import { ThemeData } from '../lib/api';
import { getOptimizedImageUrl } from '../lib/utils';

const isDev = process.env.NODE_ENV === 'development';

interface HeroSectionProps {
  theme: ThemeData | null;
  title: string;
  subtitle: string;
  isLoading?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  theme, 
  title, 
  subtitle, 
  isLoading = false 
}) => {
  // If no theme or hero image is available, or component is in loading state,
  // return a simpler header without the image
  if (isLoading || !theme || !theme.hero_image) {
    return (
      <header className="mb-8 sm:mb-12 md:mb-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {subtitle}
        </p>
      </header>
    );
  }

  if (isDev) {
    console.log(`[HeroSection] Original hero image URL: ${theme.hero_image}`);
  }
  
  // Get optimized image URL for the hero image
  const optimizedHeroImageUrl = getOptimizedImageUrl(theme.hero_image);
  if (isDev) {
    console.log(`[HeroSection] Optimized hero image URL: ${optimizedHeroImageUrl}`);
  }

  return (
    <div className="relative h-80 sm:h-96 md:h-[500px] w-full mb-12 overflow-hidden">
      {/* Hero Image */}
      <Image
        src={optimizedHeroImageUrl}
        alt={theme.hero_image_alt || title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
        priority
        fetchPriority="high"
        quality={70}
        className="object-cover"
      />
      
      {/* Overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Text Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="p-4 md:p-6 rounded-md max-w-3xl mx-4 text-center"
          style={{ backgroundColor: `${theme.hero_box_color}e6` }} // Adding transparency to the color
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 