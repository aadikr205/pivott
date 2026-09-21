import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Copy, Check } from 'lucide-react';

interface MarkdownKatexRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownKatexRenderer: React.FC<MarkdownKatexRendererProps> = ({
  content,
  isStreaming = false
}) => {
  if (!content) return null;

  // Split into code blocks, math display blocks, and regular markdown blocks
  const parts = parseBlocks(content);

  return (
    <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-3 font-normal text-[14.5px]">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} language={part.lang} code={part.content} />;
        }
        if (part.type === 'math-block') {
          return <MathDisplayBlock key={index} latex={part.content} />;
        }
        return <MarkdownBlock key={index} text={part.content} isLast={isStreaming && index === parts.length - 1} />;
      })}
    </div>
  );
};

interface BlockPart {
  type: 'code' | 'math-block' | 'markdown';
  content: string;
  lang?: string;
}

function parseBlocks(raw: string): BlockPart[] {
  const parts: BlockPart[] = [];
  const lines = raw.split('\n');
  let currentMarkdown: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let inMathBlock = false;
  let mathLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code fence
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (currentMarkdown.length > 0) {
          parts.push({ type: 'markdown', content: currentMarkdown.join('\n') });
          currentMarkdown = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeLines = [];
        continue;
      } else {
        inCode = false;
        parts.push({ type: 'code', content: codeLines.join('\n'), lang: codeLang });
        codeLines = [];
        codeLang = '';
        continue;
      }
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Check for display math $$
    if (line.trim() === '$$') {
      if (!inMathBlock) {
        if (currentMarkdown.length > 0) {
          parts.push({ type: 'markdown', content: currentMarkdown.join('\n') });
          currentMarkdown = [];
        }
        inMathBlock = true;
        mathLines = [];
        continue;
      } else {
        inMathBlock = false;
        parts.push({ type: 'math-block', content: mathLines.join('\n') });
        mathLines = [];
        continue;
      }
    }

    if (inMathBlock) {
      mathLines.push(line);
      continue;
    }

    // Check for single line $$ ... $$
    const singleLineMath = line.match(/^\$\$\s*(.+?)\s*\$\$$/);
    if (singleLineMath) {
      if (currentMarkdown.length > 0) {
        parts.push({ type: 'markdown', content: currentMarkdown.join('\n') });
        currentMarkdown = [];
      }
      parts.push({ type: 'math-block', content: singleLineMath[1] });
      continue;
    }

    currentMarkdown.push(line);
  }

  // Flush remaining
  if (inCode && codeLines.length > 0) {
    parts.push({ type: 'code', content: codeLines.join('\n'), lang: codeLang });
  } else if (inMathBlock && mathLines.length > 0) {
    parts.push({ type: 'math-block', content: mathLines.join('\n') });
  } else if (currentMarkdown.length > 0) {
    parts.push({ type: 'markdown', content: currentMarkdown.join('\n') });
  }

  return parts;
}

const CodeBlock: React.FC<{ language?: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/90 border-b border-slate-700/60 text-xs text-slate-300 font-mono">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto selection:bg-teal-700 selection:text-white leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MathDisplayBlock: React.FC<{ latex: string }> = ({ latex }) => {
  let html = '';
  try {
    html = katex.renderToString(latex.trim(), {
      displayMode: true,
      throwOnError: false
    });
  } catch (err) {
    html = `<span class="text-amber-500 font-mono text-xs">${latex}</span>`;
  }

  return (
    <div
      className="my-3 p-3.5 rounded-xl bg-teal-50/40 border border-teal-100 text-slate-900 overflow-x-auto text-center shadow-xs"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const MarkdownBlock: React.FC<{ text: string; isLast?: boolean }> = ({ text, isLast = false }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      elements.push(<MarkdownTable key={`table-${key}`} rawLines={tableRows} />);
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Table lines (starting and ending with |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableRows.push(line);
      continue;
    } else if (tableRows.length > 0) {
      flushTable(i);
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-slate-900 mt-4 mb-2 flex items-center space-x-1.5">
          <InlineRichText text={line.slice(4)} />
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-5 mb-2.5 border-b border-slate-200/80 pb-1">
          <InlineRichText text={line.slice(3)} />
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-xl font-black text-slate-900 mt-6 mb-3">
          <InlineRichText text={line.slice(2)} />
        </h1>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-2 border-l-3 border-teal-500 pl-3 py-1 bg-teal-50/30 rounded-r-lg text-slate-700 italic text-sm">
          <InlineRichText text={line.slice(2)} />
        </blockquote>
      );
    } else if (line.startsWith('---') || line.startsWith('***')) {
      elements.push(<hr key={i} className="my-3 border-slate-200" />);
    } else if (line.match(/^[\-\*]\s+/)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-slate-700 my-0.5">
          <InlineRichText text={line.replace(/^[\-\*]\s+/, '')} />
        </li>
      );
    } else if (line.match(/^\d+\.\s+/)) {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      elements.push(
        <li key={i} className="ml-4 list-decimal text-slate-700 my-0.5">
          <InlineRichText text={match ? match[2] : line} />
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="my-1 text-slate-800 leading-relaxed">
          <InlineRichText text={line} />
        </p>
      );
    }
  }

  if (tableRows.length > 0) {
    flushTable(lines.length);
  }

  return (
    <div>
      {elements}
      {isLast && (
        <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse rounded-xs align-middle" />
      )}
    </div>
  );
};

const MarkdownTable: React.FC<{ rawLines: string[] }> = ({ rawLines }) => {
  if (rawLines.length < 2) return null;

  const parseRow = (line: string) => {
    return line
      .trim()
      .slice(1, -1)
      .split('|')
      .map(c => c.trim());
  };

  const headers = parseRow(rawLines[0]);
  const rows = rawLines.slice(2).map(parseRow);

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2 text-left font-semibold text-slate-800">
                <InlineRichText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2 text-slate-700 whitespace-nowrap sm:whitespace-normal">
                  <InlineRichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Handles inline markdown: bold, italics, inline code, and inline LaTeX $ ... $
 */
const InlineRichText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by inline math $ ... $
  const mathParts = text.split(/(\$[^\$]+?\$)/g);

  return (
    <>
      {mathParts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const latex = part.slice(1, -1);
          let html = '';
          try {
            html = katex.renderToString(latex, {
              displayMode: false,
              throwOnError: false
            });
          } catch (e) {
            html = `<span class="text-amber-600 font-mono text-xs">${part}</span>`;
          }
          return <span key={idx} className="mx-0.5 inline-block" dangerouslySetInnerHTML={{ __html: html }} />;
        }

        // Format bold, italics, inline code within text
        return <span key={idx}>{parseInlineFormatting(part)}</span>;
      })}
    </>
  );
};

function parseInlineFormatting(str: string): React.ReactNode {
  // Simple token parser for **bold**, `code`, and *italic*
  const tokens = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={i} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs text-teal-800 font-medium">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={i} className="italic text-slate-800">{token.slice(1, -1)}</em>;
    }
    return token;
  });
}
