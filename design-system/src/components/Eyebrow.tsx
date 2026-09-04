import type { ReactNode } from 'react';
import { cx } from '../util';

export interface EyebrowProps {
  /** The eyebrow label text — all-caps by convention. */
  children: ReactNode;
  className?: string;
}

/**
 * An all-caps amber eyebrow (Jost 600, 0.32em tracking) that sits above a
 * section heading. The instructional voice — quiet and above the title.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={cx('tg-eyebrow', className)}>{children}</p>;
}
