import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { BaseProvider, RawProviderResult } from './base.provider';
import { RetailerName } from '../../common/types';

@Injectable()
export class AmazonProvider extends BaseProvider {
  readonly retailerName: RetailerName = 'Amazon';
  private readonly logger = new Logger(AmazonProvider.name);
  private readonly apiKey = process.env.RAINFOREST_API_KEY || '';
  private readonly baseUrl = 'https://api.rainforestapi.com/request';

  async fetchInventory(query: string, zipCode: string): Promise<RawProviderResult> {
    return this.fetchWithTimeout(async () => {
      this.logger.log(`Fetching Amazon results for "${query}"`);

      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          type: 'search',
          amazon_domain: 'amazon.com',
          search_term: query,
          zip_code: zipCode,
        },
      });

      const searchResults = response.data?.search_results || [];

      const items = searchResults.slice(0, 10).map((item: any) => ({
        title: item.title || 'Unknown Product',
        price: item.price?.value ?? item.price?.raw
          ? parseFloat(String(item.price.raw).replace(/[^0-9.]/g, ''))
          : 0,
        currency: item.price?.currency || 'USD',
        inStock: item.availability?.raw
          ? !item.availability.raw.toLowerCase().includes('unavailable')
          : true,
        storeLocation: 'Amazon.com',
        productUrl: item.link || `https://www.amazon.com/dp/${item.asin}`,
        imageUrl: item.image || '',
      }));

      this.logger.log(`Found ${items.length} Amazon results`);
      return { retailer: this.retailerName, items };
    }, 15000);
  }
}
