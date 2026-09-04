import { cx } from '../util';

export interface FormFieldProps {
  /** All-caps amber field label. */
  label: string;
  /** Control kind. @default "text" */
  as?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  /** Placeholder for text/textarea, or the empty-state label for a select. */
  placeholder?: string;
  /** Options when `as="select"`. */
  options?: string[];
  /** Optional help text below the control. */
  help?: string;
  /** Input id / name. */
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

/**
 * A labeled form control — cream input with a soft border that turns amber on
 * focus (no glow), an all-caps amber label, and optional muted help text.
 * Renders a text input, email/tel, textarea, or select. 2px corners.
 */
export function FormField({
  label,
  as = 'text',
  placeholder,
  options = [],
  help,
  name,
  defaultValue,
  required,
  className,
}: FormFieldProps) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cx('tg-field', className)}>
      <label className="tg-field__label" htmlFor={id}>
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          className="tg-field__control tg-field__control--textarea"
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
        />
      ) : as === 'select' ? (
        <select id={id} name={name} className="tg-field__control" defaultValue={defaultValue ?? ''} required={required}>
          <option value="" disabled>
            {placeholder ?? 'Select…'}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={as}
          className="tg-field__control"
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
        />
      )}
      {help ? <p className="tg-field__help">{help}</p> : null}
    </div>
  );
}
