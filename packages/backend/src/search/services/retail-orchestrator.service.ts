import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InventoryResult, SearchResponse, RetailerError } from '../../common/types';
import { StandardizationPipe } from '../pipes/standardization.pipe';
import { AmazonProvider } from '../providers/amazon.provider';
import { TargetProvider } from '../providers/target.provider';
import { MenardsProvider } from '../providers/menards.provider';
import { BaseProvider } from '../providers/base.provider';

@Injectable()
export class RetailOrchestratorService {
  private readonly logger = new Logger(RetailOrchestratorService.name);
  private readonly providers: BaseProvider[];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly standardizationPipe: StandardizationPipe,
    private readonly amazonProvider: AmazonProvider,
    private readonly targetProvider: TargetProvider,
    private readonly menardsProvider: MenardsProvider,
  ) {
    this.providers = [amazonProvider, targetProvider, menardsProvider];
  }

  async search(query: string, zipCode: string): Promise<SearchResponse> {
    const cacheKey = `${query.toLowerCase().trim()}:${zipCode}`;

    // Check cache first
    const cached = await this.cacheManager.get<SearchResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for "${cacheKey}"`);
      return cached;
    }

    this.logger.log(`Cache miss for "${cacheKey}", fetching from providers...`);

    // Fetch from all providers in parallel using Promise.allSettled
    const settledResults = await Promise.allSettled(
      this.providers.map((provider) =>
        provider.fetchInventory(query, zipCode),
      ),
    );

    const allResults: InventoryResult[] = [];
    const errors: RetailerError[] = [];

    settledResults.forEach((result, index) => {
      const provider = this.providers[index];

      if (result.status === 'fulfilled') {
        const normalized = this.standardizationPipe.normalize(result.value);
        allResults.push(...normalized);
        this.logger.log(
          `${provider.retailerName}: ${normalized.length} results`,
        );
      } else {
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);

        this.logger.error(
          `${provider.retailerName} failed: ${errorMessage}`,
        );

        errors.push({
          retailer: provider.retailerName,
          message: errorMessage,
          code: 'PROVIDER_ERROR',
        });
      }
    });

    const response: SearchResponse = {
      results: allResults,
      query,
      zipCode,
      timestamp: new Date().toISOString(),
      errors,
    };

    // Cache for 15 minutes (900000ms)
    await this.cacheManager.set(cacheKey, response, 900000);
    this.logger.log(
      `Cached ${allResults.length} results for "${cacheKey}"`,
    );

    return response;
  }
}
