import React from 'react';
import BrandMark from './BrandMark';
import { cn } from '../ui/Button';

const HeaderBrand = ({ className, iconClassName, textClassName }) => (
  <span dir="ltr" className={cn('inline-flex items-center gap-1 rounded-[14px] sm:gap-1.5', className)}>
    <BrandMark
      size="sm"
      compact
      showCaption={false}
      className={cn('-mx-1 scale-[0.9] min-[380px]:scale-[0.95] sm:scale-100', iconClassName)}
    />
    <span className={cn('min-w-0 text-center leading-none', textClassName)}>
      <span className="ad-brand-monogram block text-[0.98rem] leading-none text-[#8b1c80] dark:text-[#f18bdd] min-[380px]:text-[1.1rem] sm:text-[1.5rem]">
        AD
      </span>
      <span className="mt-0.5 block font-['Orbitron'] text-[0.38rem] font-bold uppercase tracking-[0.5em] text-[#bd7041] dark:text-[#f1b979] sm:text-[0.5rem]">
        CARD
      </span>
    </span>
  </span>
);

export default HeaderBrand;
