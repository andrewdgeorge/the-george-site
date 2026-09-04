import type { ReactNode } from 'react';
import { cx } from '../util';

export interface DecorativeNumeralProps {
  /** The number (or short label) to render, e.g. 01, 02, 03. */
  children: ReactNode;
  className?: string;
}

/**
 * A large italic Cormorant numeral at 15% amber, anchored beside or behind a
 * heading. Used wherever a sequence or count appears (occasions, FAQ, stats,
 * pricing tiers). The system's strongest defense against looking templated.
 */
export function DecorativeNumeral({ children, className }: DecorativeNumeralProps) {
  return <span className={cx('tg-numeral', className)} aria-hidden="true">{children}</span>;
}
