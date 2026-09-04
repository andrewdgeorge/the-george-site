import type { ReactNode } from 'react';
import { cx } from '../util';
import { GoldRule } from './GoldRule';
import { Eyebrow } from './Eyebrow';

export interface SectionHeadingProps {
  /** All-caps eyebrow above the heading (e.g. "The Space"). */
  eyebrow?: ReactNode;
  /** The heading itself — Cormorant. Wrap words in <em> for gold italic accents. */
  heading: ReactNode;
  /** Optional lead paragraph in Jost below the heading. */
  lead?: ReactNode;
  /** Center the block (rule, eyebrow, heading, lead). @default false */
  center?: boolean;
  className?: string;
}

/**
 * The most common composition on the site: gold-rule → eyebrow → Cormorant
 * heading → optional lead. Codified as the default for any new section so the
 * eyebrow/heading rhythm stays consistent.
 */
export function SectionHeading({
  eyebrow,
  heading,
  lead,
  center = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cx('tg-section-heading', center && 'tg-section-heading--center', className)}>
      <GoldRule />
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="tg-section-heading__h2">{heading}</h2>
      {lead ? <p className="tg-section-heading__lead">{lead}</p> : null}
    </div>
  );
}
