import type { ReactNode } from 'react';
import { cx } from '../util';

export interface OpeningPillProps {
  /** Pill label, e.g. "Opening Soon". @default "Opening Soon" */
  children?: ReactNode;
  /** Solid gold fill instead of the translucent hero variant. @default false */
  solid?: boolean;
  className?: string;
}

/**
 * A small status badge — translucent gold with a hairline, used over hero
 * imagery to announce "Opening Soon". Square-ish corners (2px), never a full
 * pill despite the name.
 */
export function OpeningPill({ children = 'Opening Soon', solid = false, className }: OpeningPillProps) {
  return (
    <span className={cx('tg-pill', solid && 'tg-pill--solid', className)}>{children}</span>
  );
}
