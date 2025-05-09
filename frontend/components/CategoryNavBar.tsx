import React, { useState, useEffect } from 'react';
import { getCategories, CategoryData } from '../lib/api';

interface CategoryNavBarProps {
  onCategorySelect: (slug: string | null) => void;
  selectedCategory: string | null;
  className?: string;
}

const CategoryNavBar: React.FC<CategoryNavBarProps> = ({ 
  onCategorySelect,
  selectedCategory,
  className = ''
}) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load categories'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle category selection
  const handleCategoryClick = (slug: string | null) => {
    onCategorySelect(slug);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`overflow-x-auto py-4 ${className}`}>
        <div className="flex space-x-2 min-w-max">
          {[1, 2, 3, 4].map(n => (
            <div 
              key={n} 
              className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={`text-sm text-red-500 py-2 ${className}`}>
        Error loading categories
      </div>
    );
  }
  
  // Empty state
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="overflow-x-auto">
        <div className="flex space-x-2 min-w-max pb-1">
          {/* All Posts option */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
              ${selectedCategory === null 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            All Posts
          </button>
          
          {/* Category options */}
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                ${selectedCategory === category.slug 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavBar; 