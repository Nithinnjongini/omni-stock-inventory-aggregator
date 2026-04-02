import { Injectable } from '@nestjs/common';
import { InventoryResult, RetailerName } from '../../common/types';

export interface RawProviderResult {
  retailer: RetailerName;
  items: Partial<InventoryResult>[];
}

@Injectable()
export abstract class BaseProvider {
  abstract readonly retailerName: RetailerName;

  abstract fetchInventory(
    query: string,
    zipCode: string,
  ): Promise<RawProviderResult>;

  protected createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${this.retailerName} timed out after ${ms}ms`)), ms),
    );
  }

  protected async fetchWithTimeout<T>(
    fetchFn: () => Promise<T>,
    timeoutMs: number = 8000,
  ): Promise<T> {
    return Promise.race([fetchFn(), this.createTimeout(timeoutMs)]);
  }
}
