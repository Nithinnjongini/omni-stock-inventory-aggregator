import { useState, type FormEvent } from 'react';
import { Search, MapPin, Locate, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string, zipCode: string) => void;
  initialZip: string;
  isLoading: boolean;
}

export default function Header({ onSearch, initialZip, isLoading }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [zipCode, setZipCode] = useState(initialZip);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && zipCode.length === 5) {
      onSearch(query.trim(), zipCode);
    }
  };

  const handleZipInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(digits);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          if (data.postcode) {
            setZipCode(data.postcode.slice(0, 5));
          }
        } catch {
          // Silently fail
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
    );
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-lg shadow-black/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Logo Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 via-accent to-fuchsia-500 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                <span className="gradient-text">Omni-Stock</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium -mt-0.5 tracking-wide uppercase">
                Inventory Aggregator
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amazon-orange-light text-amazon-orange-dark">
              Amazon
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-target-red-light text-target-red-dark">
              Target
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-menards-green-light text-menards-green-dark">
              Menards
            </span>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products across retailers..."
              className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-white border border-gray-200/80 focus:border-accent/40 focus:ring-4 focus:ring-accent/10 outline-none transition-all text-sm placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="flex gap-2.5 sm:gap-3">
            <div className="relative group flex-1 sm:flex-none sm:w-44">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                inputMode="numeric"
                value={zipCode}
                onChange={(e) => handleZipInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim() && zipCode.length === 5) {
                    handleSubmit(e);
                  }
                }}
                placeholder="Zip Code"
                maxLength={5}
                className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl bg-white border border-gray-200/80 focus:border-accent/40 focus:ring-4 focus:ring-accent/10 outline-none transition-all text-sm tabular-nums placeholder:text-gray-300 shadow-sm"
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-accent hover:bg-accent/5 transition-all"
                title="Detect location"
              >
                <Locate className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button
              type="submit"
              disabled={!query.trim() || zipCode.length !== 5 || isLoading}
              className="btn-gradient px-5 sm:px-7 py-3 sm:py-3.5 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
