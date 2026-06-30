'use client'

import DOMPurify from 'isomorphic-dompurify'

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:lg:text-3xl prose-h2:mt-12 prose-h2:mb-4
        prose-p:leading-relaxed prose-p:mb-6 prose-p:text-gray-700
        prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-8 prose-blockquote:py-2 prose-blockquote:my-12
        prose-blockquote:text-2xl prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:not-italic"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content, {
          ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote', 'br', 'img', 'figure', 'figcaption', 'span', 'div'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt'],
          ADD_ATTR: ['noopener', 'noreferrer'],
          ALLOW_DATA_ATTR: false,
        }),
      }}
    />
  )
}
