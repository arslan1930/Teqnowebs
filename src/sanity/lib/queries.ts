import groq from "groq";

export const postsQuery = groq`
  *[_type == "post" && published == true] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featuredImage {
      ...,
      alt
    }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && published == true && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featuredImage {
      ...,
      alt
    },
    body
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && published == true && defined(slug.current)][].slug.current
`;
