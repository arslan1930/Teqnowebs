import {
  PortableText as BasePortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlForImage } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-display mt-10 text-2xl font-semibold tracking-tight text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display mt-8 text-xl font-semibold tracking-tight text-ink">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-ink-soft">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-accent pl-4 text-muted italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          className="font-medium text-accent underline-offset-4 hover:underline"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const url = value ? urlForImage(value)?.width(1200).url() : null;
      if (!url) return null;
      return (
        <figure className="mt-8">
          {/* Portable Text inline images use CDN URLs; next/image not required for static export. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={value?.alt || ""}
            className="w-full object-cover"
          />
          {value?.alt ? (
            <figcaption className="mt-2 text-sm text-muted">{value.alt}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] }) {
  return <BasePortableText value={value} components={components} />;
}
