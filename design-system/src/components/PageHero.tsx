import type { ReactNode } from 'react';
import { cx } from '../util';
import { OpeningPill } from './OpeningPill';

export interface PageHeroProps {
  /** Background image URL. A dark gradient overlay is applied automatically. */
  image?: string;
  /** Alt text for the background image. */
  imageAlt?: string;
  /** Small all-caps label above the headline (e.g. "Weddings & Receptions"). */
  label?: ReactNode;
  /** The hero headline — Cormorant on cream white. Wrap words in <em> for gold italic. */
  title: ReactNode;
  /** Show the "Opening Soon" pill above the headline. @default false */
  openingPill?: boolean;
  /** Text for the pill when shown. @default "Opening Soon" */
  pillText?: string;
  className?: string;
}

/**
 * The page hero: a full-bleed image under a bottom-anchored ink gradient, with
 * an optional eyebrow label, an optional "Opening Soon" pill, and a large
 * Cormorant headline. The venue is the vessel — imagery carries, type stays quiet.
 */
export function PageHero({
  image,
  imageAlt = '',
  label,
  title,
  openingPill = false,
  pillText = 'Opening Soon',
  className,
}: PageHeroProps) {
  return (
    <section className={cx('tg-hero', className)}>
      {image ? <img src={image} alt={imageAlt} className="tg-hero__img" /> : null}
      <div className="tg-hero__overlay" />
      <div className="tg-hero__content">
        {label ? <span className="tg-hero__label">{label}</span> : null}
        {openingPill ? (
          <div className="tg-hero__pill">
            <OpeningPill>{pillText}</OpeningPill>
          </div>
        ) : null}
        <h1 className="tg-hero__h1">{title}</h1>
      </div>
    </section>
  );
}
