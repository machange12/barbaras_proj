import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  a: ({ href, children }) => {
    const external = href?.startsWith('http');

    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => <img alt={alt ?? ''} loading="lazy" src={src} />,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {children}
    </ReactMarkdown>
  );
}
