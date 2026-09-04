import { cx } from '../util';
import { Wordmark } from './Wordmark';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavBarProps {
  /** Primary navigation links (rendered left-to-right). */
  links?: NavLink[];
  /** The call-to-action link at the far right (outlined amber). */
  cta?: NavLink;
  /** Logo link target. @default "/" */
  logoHref?: string;
  className?: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'The Space', href: '/#space' },
  { label: 'The Event', href: '/#event' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Our Story', href: '/#story' },
  { label: 'FAQ', href: '/#faq' },
];

/**
 * The top navigation bar: the wordmark at left, quiet all-caps Jost links, and
 * an outlined amber "Inquire" CTA at right on a translucent cream surface with
 * a gold hairline. Links darken on hover; the CTA fills gold.
 */
export function NavBar({
  links = DEFAULT_LINKS,
  cta = { label: 'Inquire', href: '#estimate' },
  logoHref = '/',
  className,
}: NavBarProps) {
  return (
    <nav className={cx('tg-nav', className)}>
      <div className="tg-nav__inner">
        <Wordmark size="sm" href={logoHref} />
        <ul className="tg-nav__links">
          {links.map((l) => (
            <li key={l.href + l.label}>
              <a className="tg-nav__link" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
          {cta ? (
            <li>
              <a className="tg-nav__cta" href={cta.href}>
                {cta.label}
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}
