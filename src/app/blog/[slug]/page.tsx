import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@/components/PortableText";
import { urlForImage } from "@/sanity/lib/image";
import { getPostBySlug, getPostSlugs } from "@/sanity/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const imageUrl = post.featuredImage
    ? urlForImage(post.featuredImage)?.width(1400).height(788).url()
    : null;

  return (
    <div className="pt-24">
      <article>
        <header className="atmosphere relative overflow-hidden border-b border-line py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 grid-overlay" />
          <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
            <Link
              href="/blog"
              className="text-sm font-medium text-accent transition hover:text-accent-deep"
            >
              ← Blog
            </Link>
            <time
              dateTime={post.publishedAt}
              className="mt-6 block text-xs font-medium uppercase tracking-[0.14em] text-signal"
            >
              {formatDate(post.publishedAt)}
            </time>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
          </div>
        </header>

        {imageUrl ? (
          <div className="border-b border-line">
            <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={post.featuredImage?.alt || post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        ) : null}

        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            {post.body?.length ? <PortableText value={post.body} /> : null}
          </div>
        </div>
      </article>

      <section className="band-soft border-t border-line py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Need help shipping your next build?
            </h2>
            <p className="mt-2 text-muted">Talk to Teqnowebs about web, SEO, or software.</p>
          </div>
          <Link
            href="/contact"
            className="cta-gradient px-6 py-3.5 text-sm font-semibold text-white transition"
          >
            Contact Teqnowebs
          </Link>
        </div>
      </section>
    </div>
  );
}
