import { Injectable, Logger } from '@nestjs/common';
import { BaseProvider, RawProviderResult } from './base.provider';
import { RetailerName } from '../../common/types';

@Injectable()
export class MenardsProvider extends BaseProvider {
  readonly retailerName: RetailerName = 'Menards';
  private readonly logger = new Logger(MenardsProvider.name);
  private readonly useMock = process.env.MENARDS_USE_MOCK === 'true';
  private readonly headless = process.env.MENARDS_HEADLESS !== 'false';

  async fetchInventory(query: string, zipCode: string): Promise<RawProviderResult> {
    if (this.useMock) {
      this.logger.log(`Using mock data for Menards (MENARDS_USE_MOCK=true)`);
      return this.getMockResults(query, zipCode);
    }

    return this.fetchWithTimeout(async () => {
      this.logger.log(`Fetching Menards results for "${query}" near ${zipCode}`);

      let browser;
      try {
        const { chromium } = await import('playwright');

        browser = await chromium.launch({
          headless: this.headless,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const context = await browser.newContext({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        // Set store cookies to bypass the store selection UI
        await context.addCookies([
          {
            name: 'p_zipCode',
            value: zipCode,
            domain: '.menards.com',
            path: '/',
          },
          {
            name: 'p_storeId',
            value: '3210', // default Menards store, will be overridden by zip
            domain: '.menards.com',
            path: '/',
          },
        ]);

        const page = await context.newPage();

        const searchUrl = `https://www.menards.com/main/search.html?search=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 20000 });

        // Wait for product cards to load
        await page.waitForSelector('[class*="product-card"], [class*="product-list"]', {
          timeout: 8000,
        }).catch(() => {
          this.logger.warn('Menards product cards selector timed out');
        });

        // Scrape products from the DOM
        const products = await page.evaluate(() => {
          const cards = document.querySelectorAll(
            '.product-card, [data-testid="product-card"], .product-list-item',
          );
          const results: Array<{
            title: string;
            price: string;
            inStock: boolean;
            url: string;
            imageUrl: string;
          }> = [];

          cards.forEach((card) => {
            const titleEl = card.querySelector(
              '.product-card-title, .product-title, h3, h2',
            );
            const priceEl = card.querySelector(
              '.product-card-price, .price, [class*="price"]',
            );
            const stockEl = card.querySelector(
              '.in-stock, [class*="stock"], .availability',
            );
            const linkEl = card.querySelector('a[href]');
            const imgEl = card.querySelector('img');

            const title = titleEl?.textContent?.trim() || '';
            const priceText = priceEl?.textContent?.trim() || '0';
            const stockText = stockEl?.textContent?.trim() || '';
            const inStock =
              stockText.toLowerCase().includes('in-stock') ||
              stockText.toLowerCase().includes('in stock') ||
              stockText.toLowerCase().includes('available');

            if (title) {
              results.push({
                title,
                price: priceText,
                inStock,
                url: linkEl
                  ? (linkEl as HTMLAnchorElement).href
                  : '',
                imageUrl: imgEl?.src || '',
              });
            }
          });

          return results;
        });

        const items = products.slice(0, 10).map((p) => ({
          title: p.title,
          price: parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0,
          currency: 'USD',
          inStock: p.inStock,
          storeLocation: `Menards (${zipCode})`,
          productUrl: p.url.startsWith('http')
            ? p.url
            : `https://www.menards.com${p.url}`,
          imageUrl: p.imageUrl,
        }));

        this.logger.log(`Scraped ${items.length} Menards results`);

        // Fall back to mock data if scraping returned nothing
        if (items.length === 0) {
          this.logger.warn('Menards scraping returned 0 results, falling back to mock data');
          return this.getMockResults(query, zipCode);
        }

        return { retailer: this.retailerName, items };
      } catch (error) {
        this.logger.error(`Menards scraping failed: ${(error as Error).message}`);
        this.logger.warn('Falling back to mock data');
        return this.getMockResults(query, zipCode);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }, 25000);
  }

  private getMockResults(query: string, zipCode: string): RawProviderResult {
    const mockItems = [
      {
        title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Menards Select`,
        price: 49.99,
        currency: 'USD',
        inStock: true,
        storeLocation: `Menards (${zipCode})`,
        productUrl: `https://www.menards.com/main/search.html?search=${encodeURIComponent(query)}`,
        imageUrl: 'https://hw.menardc.com/main/store/20090519001/assets/images1/menards_logo.png',
      },
      {
        title: `${query.charAt(0).toUpperCase() + query.slice(1)} Kit - Professional Grade`,
        price: 89.97,
        currency: 'USD',
        inStock: true,
        storeLocation: `Menards (${zipCode})`,
        productUrl: `https://www.menards.com/main/search.html?search=${encodeURIComponent(query)}`,
        imageUrl: 'https://hw.menardc.com/main/store/20090519001/assets/images1/menards_logo.png',
      },
      {
        title: `Masterforce® ${query.charAt(0).toUpperCase() + query.slice(1)} Set`,
        price: 129.00,
        currency: 'USD',
        inStock: false,
        storeLocation: `Menards (${zipCode})`,
        productUrl: `https://www.menards.com/main/search.html?search=${encodeURIComponent(query)}`,
        imageUrl: 'https://hw.menardc.com/main/store/20090519001/assets/images1/menards_logo.png',
      },
    ];
    this.logger.log(`Returning ${mockItems.length} mock Menards results`);
    return { retailer: this.retailerName, items: mockItems };
  }
}
