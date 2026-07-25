import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  _type?: "image";
  asset?: {
    _ref?: string;
    _type?: "reference";
  };
  alt?: string;
};

export type PostListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  featuredImage?: SanityImage | null;
};

export type Post = PostListItem & {
  body?: PortableTextBlock[] | null;
};
