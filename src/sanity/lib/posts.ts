import { client } from "./client";
import {
  postBySlugQuery,
  postsQuery,
  postSlugsQuery,
} from "./queries";
import { samplePostList, samplePosts } from "./samplePosts";
import type { Post, PostListItem } from "./types";
import { hasSanityConfig } from "../env";

export async function getPosts(): Promise<PostListItem[]> {
  if (!client || !hasSanityConfig) {
    return samplePostList;
  }

  try {
    const posts = await client.fetch<PostListItem[]>(postsQuery);
    return posts?.length ? posts : samplePostList;
  } catch {
    return samplePostList;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!client || !hasSanityConfig) {
    return samplePosts.find((post) => post.slug === slug) ?? null;
  }

  try {
    const post = await client.fetch<Post | null>(postBySlugQuery, { slug });
    if (post) return post;
    return samplePosts.find((p) => p.slug === slug) ?? null;
  } catch {
    return samplePosts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getPostSlugs(): Promise<string[]> {
  if (!client || !hasSanityConfig) {
    return samplePosts.map((post) => post.slug);
  }

  try {
    const slugs = await client.fetch<string[]>(postSlugsQuery);
    const merged = new Set([
      ...(slugs || []),
      ...samplePosts.map((post) => post.slug),
    ]);
    return Array.from(merged);
  } catch {
    return samplePosts.map((post) => post.slug);
  }
}
