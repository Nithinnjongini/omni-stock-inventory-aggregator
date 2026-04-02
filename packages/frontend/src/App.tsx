import { useState, useCallback } from 'react';
import { Search, ShoppingCart, Target, TreePine, Zap, TrendingDown, MapPin } from 'lucide-react';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import ProductGrid from './components/ProductGrid';
import { useInventorySearch } from './hooks/useInventorySearch';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { RetailerName } from './types';

export default function App() {
  const [savedZip, setSavedZip] = useLocalStorage('omni-stock-zip', '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchZip, setSearchZip] = useState('');

  const { data, isLoading, isError } = useInventorySearch(searchQuery, searchZip);

  const handleSearch = useCallback(
    (query: string, zipCode: string) => {
      setSearchQuery(query);
      setSearchZip(zipCode);
      setSavedZip(zipCode);
    },
    [setSavedZip],
  );

  const results = data?.results ?? [];
  const errors = data?.errors ?? [];

  const retailersWithResults: RetailerName[] = Array.from(
    new Set(results.map((r) => r.retailer)),
  );

  const hasSearched = searchQuery.length > 0 && searchZip.length === 5;

  return (
    <div className="min-h-screen">
      <Header
        onSearch={handleSearch}
        initialZip={savedZip}
        isLoading={isLoading}
      />

      {hasSearched && (
        <StatusBar
          isLoading={isLoading}
          isError={isError}
          hasResults={results.length > 0}
          retailersWithResults={retailersWithResults}
          errors={errors}
        />
      )}

      <ProductGrid
        results={results}
        isLoading={isLoading && hasSearched}
        zipCode={searchZip}
      />

      {/* Empty search state */}
      {hasSearched && !isLoading && results.length === 0 && !isError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg font-medium">
            No items found near <span className="font-bold text-accent">{searchZip}</span>
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Try a different search term or zip code
          </p>
        </div>
      )}

      {/* Landing / Hero State */}
      {!hasSearched && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
          <div className="max-w-2xl mx-auto text-center">
            {/* Hero heading */}
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
              <span className="gradient-text">Compare Prices</span>
              <br />
              <span className="text-gray-800">Across Retailers</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Search for any product and enter your zip code to see real-time
              inventory and pricing — all in one place.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-16">
              <div className="group p-5 sm:p-6 rounded-2xl bg-white ring-1 ring-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Real-Time Search</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Live inventory data from multiple retailers simultaneously
                </p>
              </div>

              <div className="group p-5 sm:p-6 rounded-2xl bg-white ring-1 ring-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Best Price</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Automatically highlights the lowest price across all stores
                </p>
              </div>

              <div className="group p-5 sm:p-6 rounded-2xl bg-white ring-1 ring-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Local Stock</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Check in-store availability near you with zip code lookup
                </p>
              </div>
            </div>

            {/* Retailer logos row */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mt-12 sm:mt-16">
              <div className="flex items-center gap-2 text-gray-300 hover:text-amber-500 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Amazon</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors">
                <Target className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Target</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 text-gray-300 hover:text-emerald-500 transition-colors">
                <TreePine className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Menards</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="border-t border-gray-200/60 pt-6 text-center">
          <p className="text-xs text-gray-300">
            Omni-Stock Inventory Aggregator &middot; Prices and availability may vary
          </p>
        </div>
      </footer>
    </div>
  );
}
