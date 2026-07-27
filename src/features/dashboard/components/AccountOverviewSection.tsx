import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AccountOverviewCard {
  label: string;
  value: string;
  description: string;
  href: string;
  action: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
}

interface AccountOverviewSectionProps {
  cards: AccountOverviewCard[];
}

export const AccountOverviewSection = ({ cards }: AccountOverviewSectionProps) => (
  <section className="rounded-2xl bg-white/70 px-5 py-6 sm:px-6 lg:px-7">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-slate-900">Account overview</h2>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const CardIcon = card.icon;

        return (
          <div key={card.label} className="flex min-h-32 flex-col justify-between rounded-lg bg-slate-50/75 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p>
              </div>
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.iconBgClassName}`}>
                <CardIcon className={`size-4 ${card.iconClassName}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
              <span className="text-xs font-medium text-slate-500">{card.description}</span>
              <Link to={card.href} className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                {card.action} <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
