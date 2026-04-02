import { CheckCircle, Loader2, AlertCircle, ShoppingCart, Target, TreePine } from 'lucide-react';
import type { RetailerName } from '../types';

interface StatusBarProps {
  isLoading: boolean;
  isError: boolean;
  hasResults: boolean;
  retailersWithResults: RetailerName[];
  errors: { retailer: RetailerName }[];
}

const RETAILERS: {
  name: RetailerName;
  icon: typeof ShoppingCart;
  gradient: string;
  bg: string;
  text: string;
  ring: string;
}[] = [
  {
    name: 'Amazon',
    icon: ShoppingCart,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  {
    name: 'Target',
    icon: Target,
    gradient: 'from-red-400 to-rose-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
  },
  {
    name: 'Menards',
    icon: TreePine,
    gradient: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
];

export default function StatusBar({
  isLoading,
  isError,
  hasResults,
  retailersWithResults,
  errors,
}: StatusBarProps) {
  if (!isLoading && !hasResults && !isError) return null;

  const errorRetailers = new Set(errors.map((e) => e.retailer));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-slide-down">
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        {RETAILERS.map(({ name, icon: Icon, gradient, bg, text, ring }) => {
          const hasFailed = errorRetailers.has(name);
          const hasData = retailersWithResults.includes(name);
          const isFetching = isLoading && !hasData && !hasFailed;

          return (
            <div
              key={name}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl
                ${hasData ? bg : 'bg-white'}
                ${hasData ? `ring-1 ${ring}` : 'ring-1 ring-gray-100'}
                shadow-sm transition-all duration-300
                ${isFetching ? 'animate-pulse-soft' : ''}
              `}
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-sm font-semibold ${hasData ? text : 'text-gray-400'}`}>
                {name}
              </span>
              {isFetching && (
                <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              )}
              {hasData && !hasFailed && (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
              {hasFailed && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-[10px] text-red-400 font-medium">Error</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
