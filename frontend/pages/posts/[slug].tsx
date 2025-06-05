import React, { useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getPost } from '../../lib/api';
import { Post } from '../../components/PostCard';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import SocialShare from '../../components/SocialShare';
import { getOptimizedImageUrl, getPublicImageUrl, getCanonicalUrl } from '../../lib/utils';

interface PostPageProps {
  post: Post | null;
}

// Generic blur placeholder SVG (10x10 grey) as fallback
const FALLBACK_BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';

// Get site URL from environment variable with fallback
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPost(slug);
  if (!post) {
    return { notFound: true };
  }
  console.log(`[SSR] Post ${slug} data:`, { 
    id: post.id, 
    featured_image: post.featured_image,
    side_image_1: post.side_image_1,
    side_image_2: post.side_image_2
  });
  return { props: { post } };
};

const PostPage: React.FC<PostPageProps> = ({ post }) => {
  useEffect(() => {
    if (post) {
      console.log(`[PostPage] Client-side, Post ${post.id} - ${post.title}`);
      console.log(`[PostPage] Original image URLs:`, {
        featured: post.featured_image,
        side1: post.side_image_1,
        side2: post.side_image_2
      });
    }
  }, [post]);

  if (!post) return null;

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  console.log(`[PostPage] Server-side or Hydration, Post ${post.id} - ${post.title}`);
  console.log('[PostPage] Getting optimized image URLs');

  // Get optimized image URLs for rendering in the page
  const optimizedFeaturedImage = getOptimizedImageUrl(post.featured_image);
  const optimizedSideImage1 = getOptimizedImageUrl(post.side_image_1 || null);
  const optimizedSideImage2 = getOptimizedImageUrl(post.side_image_2 || null);

  console.log('[PostPage] Optimized image URLs:', {
    featured: optimizedFeaturedImage,
    side1: optimizedSideImage1,
    side2: optimizedSideImage2
  });

  // Get proper public URLs for meta tags
  const metaFeaturedImage = getPublicImageUrl(post.featured_image);
  const metaSideImage1 = getPublicImageUrl(post.side_image_1 || null);
  const metaSideImage2 = getPublicImageUrl(post.side_image_2 || null);

  console.log('[PostPage] Meta tag image URLs:', {
    featured: metaFeaturedImage,
    side1: metaSideImage1,
    side2: metaSideImage2
  });

  // Canonical URL for this post
  const canonicalUrl = getCanonicalUrl(`/posts/${post.slug}`);

  // Create JSON-LD schema data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": [
      metaFeaturedImage,
      metaSideImage1,
      metaSideImage2
    ].filter(Boolean),
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": {
      "@type": "Organization",
      "name": "Blog Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blog Template",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt || post.title} />
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph meta tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Blog Template" />
        <meta property="article:published_time" content={post.published_at} />
        {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
        
        {post.categories && post.categories.length > 0 && (
          <meta property="article:section" content={post.categories[0].name} />
        )}
        
        {post.tags && post.tags.length > 0 && post.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        
        {/* Dynamic OG images */}
        {metaFeaturedImage && (
          <>
            <meta property="og:image" content={metaFeaturedImage} />
            <meta property="og:image:alt" content={`${post.title} – Featured Image`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {metaSideImage1 && (
          <>
            <meta property="og:image" content={metaSideImage1} />
            <meta property="og:image:alt" content={`${post.title} – Side Image 1`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {metaSideImage2 && (
          <>
            <meta property="og:image" content={metaSideImage2} />
            <meta property="og:image:alt" content={`${post.title} – Side Image 2`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        
        {/* Twitter picks first available image */}
        <meta
          name="twitter:image"
          content={
            metaFeaturedImage || metaSideImage1 || metaSideImage2 || ''
          }
        />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex gap-4 flex-wrap">
            <span>{formattedDate}</span>
            <span>{post.reading_time} min read</span>
            {post.categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="underline hover:text-indigo-600 dark:hover:text-indigo-400">
                {cat.name}
              </Link>
            ))}
          </div>

          {optimizedFeaturedImage && (
            <div className="relative w-full h-64 md:h-96 mb-8">
              <Image
                src={optimizedFeaturedImage}
                alt={post.title}
                fill
                priority
                placeholder="blur"
                blurDataURL={post.blur_data_url || FALLBACK_BLUR_PLACEHOLDER}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, min(1200px, 100%)"
              />
            </div>
          )}

          {/* Inject side images after first and second thirds based on content length */}
          <div className="mb-8">
            {(() => {
              if (!post.content) return null;
              const text = post.content;
              const len = text.length;
              const firstCut = Math.floor(len / 3);
              const secondCut = Math.floor((len * 2) / 3);
              const part1 = text.slice(0, firstCut);
              const part2 = text.slice(firstCut, secondCut);
              const part3 = text.slice(secondCut);
              return (
                <>
                  {/* First segment */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} className="prose dark:prose-invert max-w-none mb-6">
                    {part1}
                  </ReactMarkdown>
                  {/* First side image */}
                  {optimizedSideImage1 && (
                    <div className="relative w-full sm:w-1/2 lg:w-1/3 float-left mb-6 lg:mr-6 h-48">
                      <Image
                        src={optimizedSideImage1}
                        alt={`${post.title} side image`}
                        fill
                        placeholder="blur"
                        blurDataURL={post.side_image_1_blur || FALLBACK_BLUR_PLACEHOLDER}
                        className="object-cover rounded-md"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                      />
                    </div>
                  )}
                  {/* Second segment */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} className="prose dark:prose-invert max-w-none mb-6">
                    {part2}
                  </ReactMarkdown>
                  {/* Second side image */}
                  {optimizedSideImage2 && (
                    <div className="relative w-full sm:w-1/2 lg:w-1/3 float-right mb-6 lg:ml-6 h-48">
                      <Image
                        src={optimizedSideImage2}
                        alt={`${post.title} side image 2`}
                        fill
                        placeholder="blur" 
                        blurDataURL={post.side_image_2_blur || FALLBACK_BLUR_PLACEHOLDER}
                        className="object-cover rounded-md"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                      />
                    </div>
                  )}
                  {/* Final segment */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} className="prose dark:prose-invert max-w-none mb-6">
                    {part3}
                  </ReactMarkdown>
                </>
              );
            })()}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <SocialShare 
              title={post.title} 
              url={canonicalUrl} 
              description={post.excerpt || ''} 
              imageUrl={metaFeaturedImage} 
            />
          </div>
        </article>
      </main>
    </div>
  );
};

export default PostPage; 