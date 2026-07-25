import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getPosts } from "@/sanity/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from Teqnowebs on web, design, SEO, and the systems that keep businesses moving.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="pt-24">
      <section className="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Teqnowebs Blog
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Practical notes on web, growth, and software.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Articles from the Teqnowebs team — publish in Sanity, then rebuild the
            static site for Hostinger.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {posts.length === 0 ? (
            <p className="text-muted">No published posts yet.</p>
          ) : (
            <ul className="space-y-14">
              {posts.map((post) => {
                const imageUrl = post.featuredImage
                  ? urlForImage(post.featuredImage)?.width(960).height(540).url()
                  : null;

                return (
                  <li key={post._id}>
                    <article className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] md:items-center">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group relative block aspect-[16/10] overflow-hidden bg-mist/60"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={post.featuredImage?.alt || post.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 45vw"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "radial-gradient(70% 60% at 70% 30%, #2563eb33, transparent 60%), linear-gradient(145deg, #e8eef6, #f7f9fc)",
                            }}
                            aria-hidden
                          />
                        )}
                      </Link>
                      <div>
                        <time
                          dateTime={post.publishedAt}
                          className="text-xs font-medium uppercase tracking-[0.14em] text-signal"
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                        <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition hover:text-accent"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="mt-6 inline-flex text-sm font-semibold text-accent transition hover:text-accent-deep"
                        >
                          Read article →
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
