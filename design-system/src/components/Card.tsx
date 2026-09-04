import type { ReactNode } from 'react';
import { cx } from '../util';

export interface CardProps {
  /** Card contents. Use `title` for a Cormorant headline, or pass your own children. */
  children?: ReactNode;
  /** Optional Cormorant title rendered above the body. */
  title?: ReactNode;
  /** Surface tone. @default "bg2" */
  tone?: 'bg2' | 'bg3';
  /** Add a 1px amber hairline border. @default false */
  bordered?: boolean;
  className?: string;
}

/**
 * A layout container, not a UI control — no hover lift, no drop shadow. Cream
 * surface (alt or deep), 4px corners, generous padding. Optional gold hairline.
 * Titles are Cormorant 400.
 */
export function Card({ children, title, tone = 'bg2', bordered = false, className }: CardProps) {
  return (
    <div
      className={cx('tg-card', tone === 'bg3' && 'tg-card--bg3', bordered && 'tg-card--bordered', className)}
    >
      {title ? <h3 className="tg-card__title">{title}</h3> : null}
      {title ? <div className="tg-card__body">{children}</div> : children}
    </div>
  );
}
