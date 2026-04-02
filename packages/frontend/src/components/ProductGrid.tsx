import { useMemo, useState } from 'react';
import { SlidersHorizontal, Package } from 'lucide-react';
import ProductCard from './ProductCard';
import type { InventoryResult, SortOption } from '../types';

interface ProductGridProps {
  results: InventoryResult[];
  isLoading: boolean;
  zipCode: string;
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="h-10 shimmer-bg" />
      <div className="h-52 shimmer-bg opacity-60" />
      <div className="p-5 space-y-3">
        <div className="h-4 shimmer-bg rounded-full w-4/5" />
        <div className="h-4 shimmer-bg rounded-full w-3/5" />
        <div className="h-8 shimmer-bg rounded-full w-2/5 mt-2" />
        <div className="h-3 shimmer-bg rounded-full w-3/4" />
        <div className="h-11 shimmer-bg rounded-xl mt-1" />
      </div>
    </div>
  );
}

export default function ProductGrid({ results, isLoading, zipCode }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'available':
        return sorted.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
      default:
        return sorted;
    }
  }, [results, sortBy]);

  const lowestPrice = useMemo(() => {
    if (results.length === 0) return 0;
    const inStockItems = results.filter((r) => r.inStock && r.price > 0);
    if (inStockItems.length === 0) return 0;
    return Math.min(...inStockItems.map((r) => r.price));
  }, [results]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 80} />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-accent" />
          <p className="text-sm font-medium text-gray-600">
            <span className="font-bold text-gray-900">{results.length}</span>
            {' '}result{results.length !== 1 ? 's' : ''} found
            {zipCode ? (
              <span className="text-gray-400"> near <span className="text-accent font-semibold">{zipCode}</span></span>
            ) : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-300" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 shadow-sm cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5'/%3E%3Cpath d='m7 9 5-5 5 5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="price-asc">Cheapest First</option>
            <option value="price-desc">Most Expensive</option>
            <option value="available">Available Locally</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {sortedResults.map((item, i) => (
          <div
            key={item.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
          >
            <ProductCard
              item={item}
              isLowestPrice={
                lowestPrice > 0 && item.price === lowestPrice && item.inStock
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
