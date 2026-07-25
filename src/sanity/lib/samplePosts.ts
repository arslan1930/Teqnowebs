import type { PortableTextBlock } from "@portabletext/types";
import type { Post, PostListItem } from "./types";

const sampleBody: PortableTextBlock[] = [
  {
    _type: "block",
    _key: "intro",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "s1",
        text: "Welcome to the Teqnowebs blog. This sample post ships with the site so /blog is never empty before you connect Sanity.",
        marks: [],
      },
    ],
  },
  {
    _type: "block",
    _key: "h2",
    style: "h2",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "s2",
        text: "How publishing works",
        marks: [],
      },
    ],
  },
  {
    _type: "block",
    _key: "p2",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "s3",
        text: "Add, edit, or delete posts in Sanity Studio. When you are ready for the live site, run npm run build and upload the fresh public_html/Teqnowebs/ folder to Hostinger.",
        marks: [],
      },
    ],
  },
];

export const samplePosts: Post[] = [
  {
    _id: "sample-welcome",
    title: "Welcome to the Teqnowebs blog",
    slug: "welcome-to-teqnowebs-blog",
    excerpt:
      "A starter post so your blog is ready on day one. Connect Sanity, publish your own articles with featured images, then rebuild for Hostinger.",
    publishedAt: "2026-07-01T10:00:00.000Z",
    featuredImage: null,
    body: sampleBody,
  },
];

export const samplePostList: PostListItem[] = samplePosts.map((post) => ({
  _id: post._id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  publishedAt: post.publishedAt,
  featuredImage: post.featuredImage,
}));
