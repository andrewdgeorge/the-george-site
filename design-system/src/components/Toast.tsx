import { cx } from '../util';

export interface ToastProps {
  /** All-caps amber label above the title (e.g. "Date Selected"). */
  label?: string;
  /** The Cormorant title line. */
  title: string;
  /** Optional supporting subtext. */
  sub?: string;
  /** Show the dismiss "×". @default true */
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * A confirmation/notification toast — ink surface with a gold left rule, an
 * all-caps amber label, a Cormorant title, and muted subtext. Enters bottom-
 * center. The only ornament is the gold rule.
 */
export function Toast({ label, title, sub, dismissible = true, onClose, className }: ToastProps) {
  return (
    <div className={cx('tg-toast', className)} role="status">
      <div className="tg-toast__rule" aria-hidden="true" />
      <div className="tg-toast__body">
        {label ? <p className="tg-toast__label">{label}</p> : null}
        <p className="tg-toast__title">{title}</p>
        {sub ? <p className="tg-toast__sub">{sub}</p> : null}
      </div>
      {dismissible ? (
        <button type="button" className="tg-toast__close" aria-label="Dismiss" onClick={onClose}>
          ×
        </button>
      ) : null}
    </div>
  );
}
