import type { ReactNode } from 'react';
import { cx } from '../util';

export interface ButtonProps {
  /** The button label. */
  children: ReactNode;
  /** Visual variant. "ink" is the primary CTA; "amber" is the gold action. @default "ink" */
  variant?: 'ink' | 'amber';
  /** Renders an anchor instead of a button when set. */
  href?: string;
  /** Native button type when rendered as a <button>. @default "button" */
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A primary call-to-action. Dark ink or gold fill, 4px corners, Jost 600
 * all-caps with wide tracking. Never gradient, never a drop shadow, never a
 * pill — the building is brick. Hover is a 240ms color change, no scale/lift.
 */
export function Button({
  children,
  variant = 'ink',
  href,
  type = 'button',
  onClick,
  disabled,
  className,
}: ButtonProps) {
  const cls = cx('tg-btn', `tg-btn--${variant}`, className);
  return href ? (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  ) : (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
