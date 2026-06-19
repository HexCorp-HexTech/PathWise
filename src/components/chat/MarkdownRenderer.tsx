/* ============================================
   VIDYA AI — Markdown & Math Renderer (KaTeX)
   ============================================ */
import React, { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';
import { Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const parsedHTML = useMemo(() => {
    if (!content) return '';    // Pre-process LaTeX equations to protect them from marked parser
    // Replace block math $$ ... $$ with placeholder tokens
    let text = content;
    const blockMathBlocks: string[] = [];
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const index = blockMathBlocks.length;
      blockMathBlocks.push(math.trim());
      return `MATHDP${index}`;
    });

    // Replace display math \[ ... \] with block placeholder
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      const index = blockMathBlocks.length;
      blockMathBlocks.push(math.trim());
      return `MATHDP${index}`;
    });

    // Replace inline math $ ... $ with placeholder tokens
    const inlineMathBlocks: string[] = [];
    text = text.replace(/\$([^$]+?)\$/g, (_, math) => {
      const index = inlineMathBlocks.length;
      inlineMathBlocks.push(math.trim());
      return `MATHIL${index}`;
    });

    // Replace inline math \( ... \) with inline placeholder
    text = text.replace(/\\\((.*?)\\\)/g, (_, math) => {
      const index = inlineMathBlocks.length;
      inlineMathBlocks.push(math.trim());
      return `MATHIL${index}`;
    });

    // Replace emoji characters inside text (remove or replace with safe HTML)
    text = text
      .replace(/👋/g, '')
      .replace(/🎉/g, '')
      .replace(/🔥/g, '')
      .replace(/✨/g, '')
      .replace(/👑/g, '')
      .replace(/📚/g, '')
      .replace(/🤖/g, '')
      .replace(/💡/g, '')
      .replace(/🌟/g, '')
      .replace(/🍬/g, '')
      .replace(/💪/g, '')
      .replace(/🛑/g, '')
      .replace(/🏃/g, '')
      .replace(/↩️/g, '')
      .replace(/📝/g, '')
      .replace(/🌍/g, '')
      .replace(/🌍/g, '')
      .replace(/🧠/g, '')
      .replace(/🏆/g, '')
      .replace(/🌈/g, '')
      .replace(/🌙/g, '')
      .replace(/🌅/g, '')
      .replace(/💯/g, '')
      .replace(/🎯/g, '')
      .replace(/📖/g, '');

    // Parse Markdown using marked (synchronous)
    let html = marked.parse(text) as string;

    // Restore block math blocks and render with KaTeX
    blockMathBlocks.forEach((math, index) => {
      try {
        const rendered = katex.renderToString(math, { displayMode: true, throwOnError: false });
        html = html.replace(`MATHDP${index}`, `<div class="math-block">${rendered}</div>`);
      } catch (err) {
        console.error('KaTeX block error:', err);
        html = html.replace(`MATHDP${index}`, `<pre class="math-error">${math}</pre>`);
      }
    });    // Restore inline math blocks and render with KaTeX
    inlineMathBlocks.forEach((math, index) => {
      try {
        const rendered = katex.renderToString(math, { displayMode: false, throwOnError: false });
        html = html.replace(`MATHIL${index}`, `<span class="math-inline">${rendered}</span>`);
      } catch (err) {
        console.error('KaTeX inline error:', err);
        html = html.replace(`MATHIL${index}`, `<code class="math-error">${math}</code>`);
      }
    });
    // Style blockquotes as premium Callouts (Info / Warning etc)
    // If it contains [!NOTE], [!IMPORTANT], [!WARNING], [!TIP] etc.
    html = html.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, (match) => {
      let type = 'note';
      let iconHtml = '';
      let cleanContent = match.replace(/<\/?blockquote>/g, '').trim();

      if (cleanContent.includes('[!NOTE]')) {
        type = 'note';
        iconHtml = '<span class="callout-icon callout-icon--note"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>';
        cleanContent = cleanContent.replace('[!NOTE]', '');
      } else if (cleanContent.includes('[!IMPORTANT]') || cleanContent.includes('[!WARNING]')) {
        type = 'warning';
        iconHtml = '<span class="callout-icon callout-icon--warning"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>';
        cleanContent = cleanContent.replace(/\[!(IMPORTANT|WARNING)\]/g, '');
      } else if (cleanContent.includes('[!TIP]')) {
        type = 'tip';
        iconHtml = '<span class="callout-icon callout-icon--tip"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></span>';
        cleanContent = cleanContent.replace('[!TIP]', '');
      } else {
        // General info tip
        type = 'tip';
        iconHtml = '<span class="callout-icon callout-icon--tip"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></span>';
      }

      return `<div class="callout callout--${type}">${iconHtml}<div class="callout-body">${cleanContent}</div></div>`;
    });

    return html;
  }, [content]);

  // Hook up copy listener for standard code block items dynamically inside rendered HTML
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const formulas = containerRef.current.querySelectorAll('.math-block, .math-inline');
    formulas.forEach((el) => {
      el.setAttribute('title', 'Click to copy LaTeX');
      (el as HTMLElement).style.cursor = 'pointer';
      const handleClick = () => {
        const text = el.querySelector('annotation')?.textContent || el.textContent || '';
        handleCopy(text);
      };
      el.addEventListener('click', handleClick);
      return () => el.removeEventListener('click', handleClick);
    });
  }, [parsedHTML]);

  return (
    <div className={`markdown-content ${className}`} ref={containerRef}>
      {copiedText && (
        <div className="copy-toast">
          <Check size={12} color="var(--color-success)" />
          <span>Copied LaTeX!</span>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: parsedHTML }} />
    </div>
  );
};
