import type { ReactNode } from 'react';
import { cx } from '../util';

export interface BrandStampProps {
  /** The geographic anchor text. @default "1827 1ST AVE N · BIRMINGHAM, AL" */
  children?: ReactNode;
  /** Flank the stamp with short 1px amber rules on either side. @default true */
  flanked?: boolean;
  /** Tone: gold on light surfaces, or muted for quieter placements. @default "amber" */
  tone?: 'amber' | 'muted';
  className?: string;
}

/**
 * The brand stamp — a quiet authentication mark. The address is the mark:
 * it says "we belong to this place" without saying it. Recurs in fixed
 * places (footer, email signature, signage). Jost 500, 0.32em tracking.
 */
export function BrandStamp({
  children = '1827 1ST AVE N · BIRMINGHAM, AL',
  flanked = true,
  tone = 'amber',
  className,
}: BrandStampProps) {
  return (
    <span
      className={cx(
        'tg-brand-stamp',
        tone === 'muted' && 'tg-brand-stamp--muted',
        flanked && 'tg-brand-stamp--flanked',
        className,
      )}
    >
      {children}
    </span>
  );
}
