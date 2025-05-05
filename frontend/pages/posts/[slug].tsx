import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getPost } from '../../lib/api';
import { Post } from '../../components/PostCard';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore - type definitions may not exist for remark-gfm but runtime import is fine
import SocialShare from '../../components/SocialShare';

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
  return { props: { post } };
};

const PostPage: React.FC<PostPageProps> = ({ post }) => {
  if (!post) return null;

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:image" content={post.featured_image || ''} />
        <meta property="og:url" content={`${SITE_URL}/posts/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        <meta name="twitter:image" content={post.featured_image || ''} />
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

          {post.featured_image && (
            <div className="relative w-full h-64 md:h-96 mb-8">
              <Image
                src={post.featured_image}
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

          {/* Side images float alongside content on large screens */}
          <div className="flow-root mb-8">
            {post.side_image_1 && (
              <div className="relative w-full sm:w-1/2 lg:w-1/3 float-left mb-4 sm:mb-6 lg:mr-6 h-48">
                <Image
                  src={post.side_image_1}
                  alt={`${post.title} side image`}
                  fill
                  placeholder="blur"
                  blurDataURL={post.side_image_1_blur || FALLBACK_BLUR_PLACEHOLDER}
                  className="object-cover rounded-md"
                  sizes="(max-width: 640px) 100vw, (min-width: 641px) 33vw"
                />
              </div>
            )}
            {post.side_image_2 && (
              <div className="relative w-full sm:w-1/2 lg:w-1/3 float-right mb-4 sm:mb-6 lg:ml-6 h-48">
                <Image
                  src={post.side_image_2}
                  alt={`${post.title} side image`}
                  fill
                  placeholder="blur"
                  blurDataURL={post.side_image_2_blur || FALLBACK_BLUR_PLACEHOLDER}
                  className="object-cover rounded-md"
                  sizes="(max-width: 640px) 100vw, (min-width: 641px) 33vw"
                />
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
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