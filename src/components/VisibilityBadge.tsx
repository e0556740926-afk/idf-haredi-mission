import { t } from '../i18n/he';
import type { Visibility } from '../data/types';

const DOT: Record<Visibility, string> = {
  shared: '●',
  summary_only: '◐',
  private: '○',
};

const COLOR_CLASS: Record<Visibility, string> = {
  shared: 'text-blue',
  summary_only: 'text-copper',
  private: 'text-muted',
};

const LABEL: Record<Visibility, string> = {
  shared: t.visibility.shared,
  summary_only: t.visibility.summary,
  private: t.visibility.private,
};

/**
 * Appears next to every money display — see docs/04-conventions.md. If a
 * component shows an amount without this, that's a bug, not a choice.
 */
export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-normal ${COLOR_CLASS[visibility]}`}
    >
      <span aria-hidden="true">{DOT[visibility]}</span>
      {LABEL[visibility]}
    </span>
  );
}
