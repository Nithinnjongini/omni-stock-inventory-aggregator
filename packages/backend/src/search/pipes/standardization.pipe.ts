import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InventoryResult } from '../../common/types';
import { RawProviderResult } from '../providers/base.provider';

@Injectable()
export class StandardizationPipe {
  normalize(raw: RawProviderResult): InventoryResult[] {
    return raw.items.map((item) => ({
      id: uuidv4(),
      retailer: raw.retailer,
      title: this.sanitizeString(item.title || 'Unknown Product'),
      price: this.sanitizePrice(item.price),
      currency: item.currency || 'USD',
      inStock: item.inStock ?? false,
      storeLocation: item.storeLocation || raw.retailer,
      productUrl: item.productUrl || '',
      imageUrl: item.imageUrl || '',
      lastUpdated: new Date().toISOString(),
    }));
  }

  private sanitizeString(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private sanitizePrice(value: number | undefined): number {
    if (value === undefined || value === null || isNaN(value)) {
      return 0;
    }
    return Math.round(value * 100) / 100;
  }
}
