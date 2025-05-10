import React, { useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getPost } from '../../lib/api';
import { Post } from '../../components/PostCard';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SocialShare from '../../components/SocialShare';
import { getOptimizedImageUrl } from '../../lib/utils';

interface PostPageProps {
  post: Post | null;
}

// Generic blur placeholder SVG (10x10 grey) as fallback
const FALLBACK_BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';

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

// Per i meta tag, usare sempre localhost:8000 anche se lato server
function getMetaImageUrl(url: string | null): string {
  if (!url) return '';
  
  // Se è già un URL assoluto, ritornalo così com'è
  if (url.startsWith('http')) {
    // Se contiene django:8000, sostituirlo con localhost:8000 per i meta tag
    if (url.includes('django:8000')) {
      return url.replace('http://django:8000', 'http://localhost:8000');
    }
    return url;
  }
  
  // Per URL relativi, aggiungi sempre localhost:8000 (mai django:8000)
  if (url.startsWith('/')) {
    return `http://localhost:8000${url}`;
  } else {
    return `http://localhost:8000/${url}`;
  }
}

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

  // Get optimized image URLs
  const optimizedFeaturedImage = getOptimizedImageUrl(post.featured_image);
  const optimizedSideImage1 = getOptimizedImageUrl(post.side_image_1 || null);
  const optimizedSideImage2 = getOptimizedImageUrl(post.side_image_2 || null);

  console.log('[PostPage] Optimized image URLs:', {
    featured: optimizedFeaturedImage,
    side1: optimizedSideImage1,
    side2: optimizedSideImage2
  });

  // Per i meta tag, usa sempre URL con localhost:8000 (non django:8000)
  const clientFeaturedImage = getMetaImageUrl(post.featured_image);
  const clientSideImage1 = getMetaImageUrl(post.side_image_1 || null);
  const clientSideImage2 = getMetaImageUrl(post.side_image_2 || null);

  console.log('[PostPage] Meta tag image URLs:', {
    featured: clientFeaturedImage,
    side1: clientSideImage1,
    side2: clientSideImage2
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:url" content={`${SITE_URL}/posts/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        {/* Dynamic OG images */}
        {clientFeaturedImage && (
          <>
            <meta property="og:image" content={clientFeaturedImage} />
            <meta property="og:image:alt" content={`${post.title} – Featured Image`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {clientSideImage1 && (
          <>
            <meta property="og:image" content={clientSideImage1} />
            <meta property="og:image:alt" content={`${post.title} – Side Image 1`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {clientSideImage2 && (
          <>
            <meta property="og:image" content={clientSideImage2} />
            <meta property="og:image:alt" content={`${post.title} – Side Image 2`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {/* Twitter picks first available image */}
        <meta
          name="twitter:image"
          content={
            clientFeaturedImage || clientSideImage1 || clientSideImage2 || ''
          }
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
                sizes="(max-width: 768px) 100vw, 1200px"
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none mb-6">
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
                        sizes="(max-width: 640px) 100vw, (min-width: 641px) 33vw"
                      />
                    </div>
                  )}
                  {/* Second segment */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none mb-6">
                    {part2}
                  </ReactMarkdown>
                  {/* Second side image */}
                  {optimizedSideImage2 && (
                    <div className="relative w-full sm:w-1/2 lg:w-1/3 float-right mb-6 lg:ml-6 h-48">
                      <Image
                        src={optimizedSideImage2}
                        alt={`${post.title} side image`}
                        fill
                        placeholder="blur"
                        blurDataURL={post.side_image_2_blur || FALLBACK_BLUR_PLACEHOLDER}
                        className="object-cover rounded-md"
                        sizes="(max-width: 640px) 100vw, (min-width: 641px) 33vw"
                      />
                    </div>
                  )}
                  {/* Third segment */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none">
                    {part3}
                  </ReactMarkdown>
                </>
              );
            })()}
          </div>
          {/* Social sharing buttons */}
          <SocialShare title={post.title} />
        </article>

        <div className="mt-12">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default PostPage; 