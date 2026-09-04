import type { ReactNode } from 'react';
import { cx } from '../util';

export interface TextLinkProps {
  /** The link label. */
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * A quiet secondary action: all-caps Jost with a 1px amber underline that
 * darkens on hover. Used for tertiary links where a filled button would be
 * too loud (e.g. "Explore pricing", "See the calendar").
 */
export function TextLink({ children, href, onClick, className }: TextLinkProps) {
  const cls = cx('tg-textlink', className);
  return href ? (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
