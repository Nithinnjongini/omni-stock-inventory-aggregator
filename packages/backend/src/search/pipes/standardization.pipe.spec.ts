import { StandardizationPipe } from './standardization.pipe';
import { RawProviderResult } from '../providers/base.provider';

describe('StandardizationPipe', () => {
  let pipe: StandardizationPipe;

  beforeEach(() => {
    pipe = new StandardizationPipe();
  });

  it('should normalize Amazon raw results', () => {
    const raw: RawProviderResult = {
      retailer: 'Amazon',
      items: [
        {
          title: '  DeWalt 20V MAX Drill  ',
          price: 129.99,
          currency: 'USD',
          inStock: true,
          storeLocation: 'Amazon.com',
          productUrl: 'https://www.amazon.com/dp/B12345',
          imageUrl: 'https://images.amazon.com/img.jpg',
        },
      ],
    };

    const results = pipe.normalize(raw);

    expect(results).toHaveLength(1);
    expect(results[0].retailer).toBe('Amazon');
    expect(results[0].title).toBe('DeWalt 20V MAX Drill');
    expect(results[0].price).toBe(129.99);
    expect(results[0].currency).toBe('USD');
    expect(results[0].inStock).toBe(true);
    expect(results[0].id).toBeDefined();
    expect(results[0].lastUpdated).toBeDefined();
  });

  it('should handle missing fields with defaults', () => {
    const raw: RawProviderResult = {
      retailer: 'Target',
      items: [
        {
          title: undefined,
          price: undefined,
          inStock: undefined,
        },
      ],
    };

    const results = pipe.normalize(raw);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Unknown Product');
    expect(results[0].price).toBe(0);
    expect(results[0].inStock).toBe(false);
    expect(results[0].currency).toBe('USD');
    expect(results[0].storeLocation).toBe('Target');
  });

  it('should sanitize price correctly', () => {
    const raw: RawProviderResult = {
      retailer: 'Menards',
      items: [
        { price: 99.999 },
        { price: NaN },
        { price: 0 },
      ],
    };

    const results = pipe.normalize(raw);

    expect(results[0].price).toBe(100);
    expect(results[1].price).toBe(0);
    expect(results[2].price).toBe(0);
  });

  it('should return empty array for empty items', () => {
    const raw: RawProviderResult = {
      retailer: 'Amazon',
      items: [],
    };

    const results = pipe.normalize(raw);
    expect(results).toHaveLength(0);
  });
});
