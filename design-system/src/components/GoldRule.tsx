import { cx } from '../util';

export interface GoldRuleProps {
  className?: string;
}

/**
 * The gold-rule — the brand's signature mark. A 3.5rem × 1px amber line that
 * appears above every section heading, like a serif's terminal stroke. Do not
 * skip it; do not vary its width without a reason.
 */
export function GoldRule({ className }: GoldRuleProps) {
  return <hr className={cx('tg-gold-rule', className)} aria-hidden="true" />;
}
