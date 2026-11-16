import React from 'react';
import Card from '../ui/Card';
import { cn } from '../ui/Button';
import './AdminNeonGlow.css';

const StatCard = ({ title, value, note, icon: Icon, progress = 40, wide = false }) => {
  const progressValue = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <Card
      variant="elevated"
      className={cn(
        'admin-stat-card relative w-full p-0 transition-colors',
        wide && 'col-span-2'
      )}
    >
      <span className="admin-stat-card-shimmer" aria-hidden="true" />
      <div className="relative flex min-h-[7rem] flex-col justify-between overflow-hidden rounded-[inherit] p-3 text-start sm:p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="max-w-[12rem] text-[11px] font-semibold leading-4 text-[var(--color-text-secondary)] sm:text-xs">
              {title}
            </p>
          </div>

          <div className="admin-icon-glow flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
            <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>

        <div className="relative mt-2">
          <p className="whitespace-nowrap text-[clamp(1rem,4vw,1.45rem)] font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-2xl">
            {value}
          </p>
          {note && (
            <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-[var(--color-text-secondary)] sm:text-xs">
              {note}
            </p>
          )}
        </div>

        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-[color:rgb(var(--color-border-rgb)/0.42)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-primary-hover))]"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
