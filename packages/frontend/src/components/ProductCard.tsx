import { ExternalLink, ImageOff, ShoppingCart, Target, TreePine, Tag, TrendingDown } from 'lucide-react';
import type { InventoryResult, RetailerName } from '../types';

const RETAILER_CONFIG: Record<
  RetailerName,
  {
    gradient: string;
    badgeBg: string;
    badgeText: string;
    btnGradient: string;
    btnHover: string;
    ring: string;
    icon: typeof ShoppingCart;
  }
> = {
  Amazon: {
    gradient: 'from-amber-400 to-orange-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    btnGradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
    btnHover: 'hover:from-amber-500 hover:to-orange-600',
    ring: 'hover:ring-amber-200',
    icon: ShoppingCart,
  },
  Target: {
    gradient: 'from-red-400 to-rose-500',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    btnGradient: 'bg-gradient-to-r from-red-400 to-rose-500',
    btnHover: 'hover:from-red-500 hover:to-rose-600',
    ring: 'hover:ring-red-200',
    icon: Target,
  },
  Menards: {
    gradient: 'from-emerald-400 to-green-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    btnGradient: 'bg-gradient-to-r from-emerald-400 to-green-500',
    btnHover: 'hover:from-emerald-500 hover:to-green-600',
    ring: 'hover:ring-emerald-200',
    icon: TreePine,
  },
};

interface ProductCardProps {
  item: InventoryResult;
  isLowestPrice?: boolean;
}

export default function ProductCard({ item, isLowestPrice }: ProductCardProps) {
  const config = RETAILER_CONFIG[item.retailer];
  const Icon = config.icon;

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-card hover:shadow-card-hover ${config.ring} ring-1 ring-gray-100 hover:ring-2 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1`}
    >
      {/* Best Price Badge */}
      {isLowestPrice && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
          <TrendingDown className="w-3 h-3" />
          Best Price
        </div>
      )}

      {/* Retailer Badge */}
      <div className={`px-4 py-2.5 flex items-center justify-between bg-gradient-to-r ${config.gradient}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/90" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">{item.retailer}</span>
        </div>
        <Tag className="w-3.5 h-3.5 text-white/50" />
      </div>

      {/* Image */}
      <div className="h-52 flex items-center justify-center p-5 bg-gradient-to-b from-gray-50/80 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.03),transparent_70%)]" />
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out relative z-10"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex flex-col items-center text-gray-200 ${item.imageUrl ? 'hidden' : ''}`}>
          <ImageOff className="w-14 h-14" />
          <span className="text-xs mt-2 font-medium">No Image</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col border-t border-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 min-h-[2.5rem] leading-snug group-hover:text-gray-900 transition-colors">
          {item.title}
        </h3>

        <div className="mt-auto space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-gray-400">$</span>
            <span className="text-2xl font-extrabold tabular-nums text-gray-900">
              {item.price.toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
            <p className={`text-xs font-medium ${item.inStock ? 'text-emerald-600' : 'text-gray-400'}`}>
              {item.inStock
                ? `In Stock at ${item.storeLocation}`
                : 'Out of Stock / Shipping Only'}
            </p>
          </div>

          {/* Action Button */}
          <a
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl text-white text-sm font-bold ${config.btnGradient} ${config.btnHover} transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]`}
          >
            View on {item.retailer}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
