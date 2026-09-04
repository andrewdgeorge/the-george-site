import { cx } from '../util';

export interface FoundersBadgeProps {
  /** Badge text. @default "Founders Rate" */
  children?: string;
  className?: string;
}

/**
 * A quiet inline badge for a limited offer (e.g. the founders rate above the
 * pricing calculator). Cream chip, faint ink border, tiny bold amber all-caps
 * tag. No color beyond the one accent.
 */
export function FoundersBadge({ children = 'Founders Rate', className }: FoundersBadgeProps) {
  return (
    <span className={cx('tg-founders', className)}>
      <span className="tg-founders__tag">{children}</span>
    </span>
  );
}
