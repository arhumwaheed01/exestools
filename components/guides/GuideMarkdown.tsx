import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

type Props = {
  content: string;
  /** Style the first blockquote as a printable routine card (classroom tool page). */
  routineCardAside?: boolean;
};

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function markdownLink(href: string | undefined, children: ReactNode) {
  if (!href) return <span>{children}</span>;
  if (isInternalHref(href)) {
    return (
      <Link href={href} className="font-semibold text-accent hover:underline">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className="font-semibold text-accent hover:underline" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function GuideMarkdown({ content, routineCardAside }: Props) {
  let blockquoteCount = 0;

  const components: Components = {
    // Never emit a second page H1 from markdown (hub intros, paste mistakes).
    h1: ({ children }) => (
      <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    a: ({ href, children }) => markdownLink(href, children),
    blockquote: ({ children }) => {
      blockquoteCount += 1;
      const isRoutine = routineCardAside && blockquoteCount === 1;
      if (isRoutine) {
        return (
          <aside className="my-4 rounded-2xl border border-accent/30 bg-surface-2 px-4 py-4 sm:px-5">
            <div className="text-sm leading-relaxed text-muted sm:text-base [&>p:first-child]:mt-0">
              {children}
            </div>
            <p className="mt-3 text-xs text-muted">
              Copy into a document, adjust it, and print this card for your desk.
            </p>
          </aside>
        );
      }
      return (
        <blockquote className="my-4 border-l-4 border-accent/40 pl-4 text-sm leading-relaxed text-muted sm:text-base">
          {children}
        </blockquote>
      );
    },
    table: ({ children }) => (
      <div className="mt-4 overflow-x-auto" tabIndex={0} role="region">
        <table className="w-full min-w-[18rem] border-collapse text-left text-sm leading-relaxed">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody className="text-muted">{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-border/60 align-top">{children}</tr>,
    th: ({ children }) => (
      <th className="py-2 pr-3 font-semibold text-foreground">{children}</th>
    ),
    td: ({ children }) => <td className="py-2.5 pr-3">{children}</td>,
    hr: () => <hr className="my-8 border-border" />,
    code: ({ children }) => (
      <code className="rounded bg-surface-2 px-1 py-0.5 text-sm text-foreground">{children}</code>
    ),
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      const isLocal = src.startsWith("/");
      if (!isLocal) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} className="my-6 h-auto w-full max-w-3xl rounded-xl border border-border" />
        );
      }
      return (
        <Image
          src={src}
          alt={alt ?? ""}
          width={1280}
          height={900}
          className="my-6 h-auto w-full max-w-3xl rounded-xl border border-border"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      );
    },
  };

  return (
    <div className="guide-markdown max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
