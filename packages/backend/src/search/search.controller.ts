import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchQueryDto } from './dto/search-query.dto';
import { RetailOrchestratorService } from './services/retail-orchestrator.service';

@ApiTags('search')
@Controller('api/search')
export class SearchController {
  constructor(
    private readonly retailOrchestrator: RetailOrchestratorService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search inventory across Amazon, Target, and Menards',
    description:
      'Aggregates real-time inventory and pricing from multiple retailers based on a search query and zip code.',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Product search query', example: 'DeWalt 20V Drill' })
  @ApiQuery({ name: 'zipCode', required: true, description: '5-digit US Zip Code', example: '55401' })
  @ApiResponse({ status: 200, description: 'Search results from all available retailers' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async search(@Query() searchQuery: SearchQueryDto) {
    return this.retailOrchestrator.search(
      searchQuery.query,
      searchQuery.zipCode,
    );
  }
}
