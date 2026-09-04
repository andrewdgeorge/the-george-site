import { cx } from '../util';
import { BrandStamp } from './BrandStamp';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Address lines shown under the wordmark. */
  address?: string[];
  /** Link columns (rendered to the right of the wordmark block). */
  columns?: FooterColumn[];
  /** Legal / copyright line at the bottom. */
  legal?: string;
  className?: string;
}

const DEFAULT_ADDRESS = ['1827 1st Avenue North, Suite 103', 'Birmingham, AL 35203'];

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    heading: 'The Event',
    links: [
      { label: 'Weddings', href: '/weddings' },
      { label: 'Corporate', href: '/corporate-events' },
      { label: 'Galas', href: '/galas' },
    ],
  },
  {
    heading: 'Visit',
    links: [
      { label: 'The Space', href: '/#space' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { label: 'Inquire', href: '#estimate' },
      { label: 'hello@thegeorgebhm.com', href: 'mailto:hello@thegeorgebhm.com' },
    ],
  },
];

/**
 * The site footer — an ink dark zone. Wordmark and address at left, up to three
 * link columns with amber all-caps headings, and the brand stamp centered
 * along the bottom rule. Dark zones belong here, the footer, and the hero.
 */
export function Footer({
  address = DEFAULT_ADDRESS,
  columns = DEFAULT_COLUMNS,
  legal = '© The George. All rights reserved.',
  className,
}: FooterProps) {
  return (
    <footer className={cx('tg-footer', className)}>
      <div className="tg-footer__inner">
        <div className="tg-footer__grid">
          <div>
            <span className="tg-footer__logo">
              THE <em>GEORGE</em>
            </span>
            <p className="tg-footer__addr">
              {address.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < address.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>
          {columns.map((col) => (
            <div className="tg-footer__col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul className="tg-footer__links">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="tg-footer__bottom">
          <BrandStamp />
          <p className="tg-footer__legal">{legal}</p>
        </div>
      </div>
    </footer>
  );
}
