import { cx } from '../util';

export interface WordmarkProps {
  /** Visual size of the wordmark. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Render for a dark surface (cream "THE", gold "GEORGE"). @default false */
  onDark?: boolean;
  /** Optional link target; renders an anchor when set, otherwise a span. */
  href?: string;
  className?: string;
}

/**
 * The George wordmark. Cinzel "THE" with the italic-normal gold "GEORGE".
 * The building's nameplate — used only as the logo, never as a headline.
 */
export function Wordmark({ size = 'md', onDark = false, href, className }: WordmarkProps) {
  const cls = cx(
    'tg-wordmark',
    `tg-wordmark--${size}`,
    onDark && 'tg-wordmark--on-dark',
    className,
  );
  const content = (
    <>
      THE <em>GEORGE</em>
    </>
  );
  return href ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <span className={cls}>{content}</span>
  );
}
