"use client";

import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import { getStrapiMedia } from "@/lib/strapi";

export function ProductDescription({ content }: { content: BlocksContent }) {
  if (content.length === 0) return null;

  return (
    <section aria-labelledby="product-description" className="mt-8 border-t border-slate-200 pt-6">
      <h2 id="product-description" className="mb-4 text-lg font-extrabold tracking-tight">
        Description
      </h2>
      <div className="max-w-3xl text-sm leading-7 text-ink [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-3 [&_strong]:font-bold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
        <BlocksRenderer
          content={content}
          blocks={{
            image: ({ image }) => {
              const src = getStrapiMedia(image.url);
              if (!src) return null;
              return (
                <figure className="my-5">
                  <img
                    src={src}
                    alt={image.alternativeText || image.name}
                    className="h-auto max-w-full rounded-lg"
                  />
                  {image.caption && (
                    <figcaption className="mt-2 text-xs text-muted">{image.caption}</figcaption>
                  )}
                </figure>
              );
            },
          }}
        />
      </div>
    </section>
  );
}