import React from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';

const DashboardHeader = ({ isArabic, userName, currentDateLabel }) => {
  return (
    <section className="admin-dashboard-header mx-auto w-full rounded-2xl border p-4 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <span className="admin-dashboard-label inline-flex items-center gap-2 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {isArabic ? 'لوحة القيادة الإدارية' : 'Admin control center'}
          </span>

          <div className="space-y-1.5">
            <h1 className="text-[1.45rem] font-black leading-tight text-[var(--color-text)] sm:text-[1.9rem]">
              {isArabic ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              {isArabic
                ? 'نظرة عامة سريعة على أداء المتجر، آخر الطلبات، الشحن اليدوي، والإجراءات الأساسية التي يحتاجها الأدمن يوميًا.'
                : 'A fast overview of store performance, recent orders, manual topups, and the actions admins use most often.'}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 lg:max-w-[24rem]">
          <div className="admin-dashboard-info-tile min-w-0 rounded-xl px-3 py-3">
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              {isArabic ? 'مرحبًا بعودتك' : 'Welcome back'}
            </p>
            <p className="mt-1 truncate text-sm font-bold leading-5 text-[var(--color-text)] sm:text-base" title={userName}>
              {userName || (isArabic ? 'مشرف النظام' : 'Administrator')}
            </p>
          </div>

          <div className="admin-dashboard-info-tile min-w-0 rounded-xl px-3 py-3">
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <p className="text-xs font-medium">
                {isArabic ? 'تاريخ اليوم' : 'Today'}
              </p>
            </div>
            <p className="mt-1 text-xs font-bold leading-5 text-[var(--color-text)] sm:text-sm">
              {currentDateLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
