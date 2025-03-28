declare module 'react-markdown' {
  import React from 'react';

  interface ReactMarkdownOptions {
    children: string;
    className?: string;
    components?: Record<string, React.ComponentType<any>>;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    allowedElements?: string[];
    disallowedElements?: string[];
    unwrapDisallowed?: boolean;
    allowElement?: (element: any, index: number, parent: any) => boolean;
    skipHtml?: boolean;
    sourcePos?: boolean;
    rawSourcePos?: boolean;
    includeElementIndex?: boolean;
    transformLinkUri?: ((uri: string, children?: React.ReactNode, title?: string) => string) | null;
    transformImageUri?: ((uri: string, children?: React.ReactNode, title?: string, alt?: string) => string) | null;
    linkTarget?: string | ((href: string, children: React.ReactNode, title?: string) => string);
  }

  const ReactMarkdown: React.FC<ReactMarkdownOptions>;

  export default ReactMarkdown;
}
