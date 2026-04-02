import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RetailOrchestratorService } from './retail-orchestrator.service';
import { StandardizationPipe } from '../pipes/standardization.pipe';
import { AmazonProvider } from '../providers/amazon.provider';
import { TargetProvider } from '../providers/target.provider';
import { MenardsProvider } from '../providers/menards.provider';

describe('RetailOrchestratorService', () => {
  let service: RetailOrchestratorService;
  let mockCacheManager: Record<string, jest.Mock>;

  const mockAmazonProvider = {
    retailerName: 'Amazon',
    fetchInventory: jest.fn(),
  };

  const mockTargetProvider = {
    retailerName: 'Target',
    fetchInventory: jest.fn(),
  };

  const mockMenardsProvider = {
    retailerName: 'Menards',
    fetchInventory: jest.fn(),
  };

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetailOrchestratorService,
        StandardizationPipe,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: AmazonProvider, useValue: mockAmazonProvider },
        { provide: TargetProvider, useValue: mockTargetProvider },
        { provide: MenardsProvider, useValue: mockMenardsProvider },
      ],
    }).compile();

    service = module.get<RetailOrchestratorService>(RetailOrchestratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached results if available', async () => {
    const cachedResponse = {
      results: [],
      query: 'drill',
      zipCode: '55401',
      timestamp: new Date().toISOString(),
      errors: [],
    };
    mockCacheManager.get.mockResolvedValue(cachedResponse);

    const result = await service.search('drill', '55401');

    expect(result).toEqual(cachedResponse);
    expect(mockAmazonProvider.fetchInventory).not.toHaveBeenCalled();
  });

  it('should fetch from all providers in parallel using Promise.allSettled', async () => {
    mockAmazonProvider.fetchInventory.mockResolvedValue({
      retailer: 'Amazon',
      items: [{ title: 'Drill A', price: 99.99, inStock: true }],
    });
    mockTargetProvider.fetchInventory.mockResolvedValue({
      retailer: 'Target',
      items: [{ title: 'Drill B', price: 89.99, inStock: true }],
    });
    mockMenardsProvider.fetchInventory.mockResolvedValue({
      retailer: 'Menards',
      items: [{ title: 'Drill C', price: 79.99, inStock: false }],
    });

    const result = await service.search('drill', '55401');

    expect(result.results).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
    expect(mockCacheManager.set).toHaveBeenCalled();
  });

  it('should handle provider failures gracefully', async () => {
    mockAmazonProvider.fetchInventory.mockResolvedValue({
      retailer: 'Amazon',
      items: [{ title: 'Drill A', price: 99.99, inStock: true }],
    });
    mockTargetProvider.fetchInventory.mockRejectedValue(
      new Error('Target API timeout'),
    );
    mockMenardsProvider.fetchInventory.mockRejectedValue(
      new Error('Menards scraping failed'),
    );

    const result = await service.search('drill', '55401');

    expect(result.results).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].retailer).toBe('Target');
    expect(result.errors[1].retailer).toBe('Menards');
  });
});
