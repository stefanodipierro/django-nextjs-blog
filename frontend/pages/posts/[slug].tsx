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

interface PostPageProps {
  post: Post | null;
}

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
              <Image src={post.featured_image} alt={post.title} fill className="object-cover rounded-lg" />
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>

        <div className="mt-12">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
};

export default PostPage; 