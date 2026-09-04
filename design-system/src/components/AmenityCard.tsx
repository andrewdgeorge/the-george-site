import { cx } from '../util';

export interface AmenityCardProps {
  /** The amenity name, e.g. "The Parlor". Rendered all-caps. */
  name: string;
  /** A short supporting description. */
  description: string;
  className?: string;
}

/**
 * A "what's included" tile: cream surface with a gold hairline, an all-caps
 * Jost name, and a short muted description. Used in the amenities grid on the
 * event-type pages. Differentiation lives in copy, never in color.
 */
export function AmenityCard({ name, description, className }: AmenityCardProps) {
  return (
    <div className={cx('tg-amenity', className)}>
      <div className="tg-amenity__name">{name}</div>
      <p className="tg-amenity__desc">{description}</p>
    </div>
  );
}
