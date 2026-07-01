import { useState, useMemo } from "react";
import { glossary } from "../../data/glossary";
import { IS_MOBILE } from "../../utils/device";

// Build a single case-sensitive regex from every glossary key, longest-first
// so multi-word terms ("Random Access Memory") match before their abbreviations.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const TERMS = Object.keys(glossary).sort((a, b) => b.length - a.length);
const TERM_REGEX = new RegExp(
  `\\b(${TERMS.map(escapeRegex).join("|")})\\b`,
  "g",
);

// Splits `text` into [{ kind: 'text'|'term', value }] segments.
function parse(text) {
  const out = [];
  let last = 0;
  TERM_REGEX.lastIndex = 0;
  let m;
  while ((m = TERM_REGEX.exec(text)) !== null) {
    if (m.index > last)
      out.push({ kind: "text", value: text.slice(last, m.index) });
    out.push({ kind: "term", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}

function JargonText({ text, onJargonClick, disabled }) {
  // Mobile: track which inline definitions are expanded (by segment index)
  const [expanded, setExpanded] = useState(() => new Set());
  const segments = useMemo(() => (text ? parse(text) : []), [text]);

  if (!text) return null;
  if (disabled) return text;

  return segments.map((seg, i) => {
    if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
    const entry = glossary[seg.value];
    if (!entry) return <span key={i}>{seg.value}</span>;

    const isOpen = expanded.has(i);
    const toggleInline = () => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
    };

    return (
      <span key={i} className="jargon-wrap">
        <span
          className={`jargon${isOpen ? " jargon--open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (IS_MOBILE) toggleInline();
            else onJargonClick?.(seg.value, e);
          }}
        >
          {seg.value}
        </span>
        {IS_MOBILE && isOpen && (
          <span className="jargon-inline">
            <span className="jargon-inline__name">{entry.name}</span>
            <span className="jargon-inline__short">{entry.short}</span>
            {entry.example && (
              <span className="jargon-inline__example">{entry.example}</span>
            )}
          </span>
        )}
      </span>
    );
  });
}

export default JargonText;
