import { cx } from '../util';

export interface PriceCardProps {
  /** The day or tier label, e.g. "Saturday". Rendered all-caps. */
  day: string;
  /** The price, e.g. "$8,750". Cormorant numerals. */
  price: string;
  className?: string;
}

/**
 * A single pricing tier: centered card with an all-caps day label and a large
 * Cormorant price. Transparent pricing is load-bearing — the site states the
 * number rather than gating it behind an inquiry.
 */
export function PriceCard({ day, price, className }: PriceCardProps) {
  return (
    <div className={cx('tg-price', className)}>
      <span className="tg-price__day">{day}</span>
      <span className="tg-price__num">{price}</span>
    </div>
  );
}
