import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServicePackage } from '../types';

interface ServicePackageGridProps {
  packages: ServicePackage[];
  selectedPackageId?: string;
  onSelect?: (packageId: string) => void;
}

const splitFeatures = (features?: string | null) => (
  (features ?? '')
    .split(/\r?\n|,/)
    .map(feature => feature.trim())
    .filter(Boolean)
);

export const ServicePackageGrid = ({ packages, selectedPackageId, onSelect }: ServicePackageGridProps) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    {packages.map((pkg, index) => {
      const isSelected = selectedPackageId === pkg.id;
      const features = splitFeatures(pkg.features);

      return (
        <button
          key={pkg.id ?? `${pkg.tier}-${index}`}
          type="button"
          onClick={() => pkg.id && onSelect?.(pkg.id)}
          disabled={!onSelect || !pkg.id}
          className={cn(
            'rounded-lg border bg-white p-5 text-left shadow-sm transition-all',
            onSelect ? 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5' : 'cursor-default',
            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{pkg.tier}</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">{pkg.title}</h3>
            </div>
            {isSelected && <CheckCircle2 className="size-5 text-primary" />}
          </div>
          {pkg.description && <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{pkg.description}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 px-3 py-2">
              <DollarSign className="size-4 text-emerald-600" />
              <p className="mt-1 text-sm font-black text-slate-900">{Number(pkg.price).toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aivora Coin</p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-2">
              <Clock className="size-4 text-blue-600" />
              <p className="mt-1 text-sm font-black text-slate-900">{pkg.deliveryDays} days</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Delivery</p>
            </div>
          </div>
          {features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm font-medium text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </button>
      );
    })}
  </div>
);

