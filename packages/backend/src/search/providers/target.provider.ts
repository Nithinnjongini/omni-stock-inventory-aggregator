import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { BaseProvider, RawProviderResult } from './base.provider';
import { RetailerName } from '../../common/types';

// Zip prefix → nearest Target store ID mapping (major metro areas)
const ZIP_STORE_MAP: Record<string, string> = {
  '100': '1262', // New York, NY
  '101': '1262',
  '110': '1262',
  '112': '1267', // Brooklyn, NY
  '200': '2088', // Washington, DC
  '201': '2088',
  '300': '2247', // Atlanta, GA
  '303': '2247',
  '330': '3284', // Miami, FL
  '331': '3284',
  '327': '1794', // Orlando, FL
  '400': '2778', // Louisville, KY
  '432': '1274', // Columbus, OH
  '441': '2089', // Cleveland, OH
  '480': '2773', // Detroit, MI
  '550': '1375', // Minneapolis, MN
  '551': '1375',
  '553': '1375',
  '554': '2187',
  '600': '1924', // Chicago, IL
  '606': '1924',
  '610': '1924',
  '700': '2085', // New Orleans, LA
  '750': '1040', // Dallas, TX
  '770': '509',  // Houston, TX
  '787': '2535', // Austin, TX
  '852': '2769', // Phoenix, AZ
  '900': '3952', // Los Angeles, CA
  '902': '3952',
  '941': '2766', // San Francisco, CA
  '945': '2766',
  '950': '3264', // San Jose, CA
  '980': '2172', // Seattle, WA
  '981': '2172',
};

@Injectable()
export class TargetProvider extends BaseProvider {
  readonly retailerName: RetailerName = 'Target';
  private readonly logger = new Logger(TargetProvider.name);
  private readonly redSkyKey = process.env.TARGET_REDSKY_KEY || 'ff457966e64d5e877fdbad070f276d18ecec4a01';
  private readonly maxRetries = 2;

  async fetchInventory(query: string, zipCode: string): Promise<RawProviderResult> {
    return this.fetchWithTimeout(async () => {
      this.logger.log(`Fetching Target results for "${query}" near ${zipCode}`);

      const storeId = this.resolveStoreId(zipCode);
      this.logger.log(`Resolved Target storeId: ${storeId} for zip ${zipCode}`);

      const searchResults = await this.searchProducts(query, storeId);

      const items = searchResults.slice(0, 10).map((item: any) => {
        const pricing = item.price || {};

        const price = pricing.current_retail
          ?? (pricing.formatted_current_price
            ? parseFloat(String(pricing.formatted_current_price).replace(/[^0-9.]/g, ''))
            : 0);

        // Derive stock status from available fulfillment data
        const fulfillment = item.fulfillment || {};
        const storeOptions = fulfillment.store_options || [];
        const pickupAvail = storeOptions[0]?.order_pickup?.availability_status;
        const shipAvail = fulfillment.shipping_options?.availability_status;
        const inStock = pickupAvail === 'IN_STOCK'
          || shipAvail === 'IN_STOCK'
          || fulfillment.is_out_of_stock_in_all_store_locations === false
          || price > 0; // if priced, assume purchasable

        return {
          title: item.item?.product_description?.title || 'Unknown Product',
          price,
          currency: 'USD',
          inStock,
          storeLocation: `Target (${zipCode})`,
          productUrl: item.item?.enrichment?.buy_url
            || `https://www.target.com/p/-/A-${item.tcin}`,
          imageUrl: item.item?.enrichment?.images?.primary_image_url || '',
        };
      });

      this.logger.log(`Found ${items.length} Target results`);
      return { retailer: this.retailerName, items };
    }, 12000);
  }

  private resolveStoreId(zipCode: string): string {
    // Try 3-digit prefix first, then 2-digit
    return ZIP_STORE_MAP[zipCode.slice(0, 3)]
      || ZIP_STORE_MAP[zipCode.slice(0, 2) + '0']
      || '1375'; // Minneapolis fallback
  }

  private async searchProducts(query: string, storeId: string): Promise<any[]> {
    const config: AxiosRequestConfig = {
      params: {
        key: this.redSkyKey,
        channel: 'WEB',
        count: 10,
        default_purchasability_filter: 'true',
        include_sponsored: 'true',
        keyword: query,
        offset: 0,
        page: `/s/${query}`,
        platform: 'desktop',
        pricing_store_id: storeId,
        scheduled_delivery_store_id: storeId,
        store_ids: storeId,
        visitor_id: `visitor_${Date.now()}`,
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.target.com',
        'Referer': 'https://www.target.com/',
      },
      timeout: 8000,
    };

    // Retry logic to handle intermittent socket hang up errors
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(
          'https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2',
          config,
        );
        return response.data?.data?.search?.products || [];
      } catch (error) {
        const msg = (error as Error).message;
        if (attempt < this.maxRetries && (msg.includes('socket hang up') || msg.includes('ECONNRESET'))) {
          this.logger.warn(`Target search attempt ${attempt} failed (${msg}), retrying...`);
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        this.logger.warn(`Target product search failed after ${attempt} attempt(s): ${msg}`);
        return [];
      }
    }
    return [];
  }
}
