import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { RetailOrchestratorService } from './services/retail-orchestrator.service';
import { StandardizationPipe } from './pipes/standardization.pipe';
import { AmazonProvider } from './providers/amazon.provider';
import { TargetProvider } from './providers/target.provider';
import { MenardsProvider } from './providers/menards.provider';

@Module({
  controllers: [SearchController],
  providers: [
    RetailOrchestratorService,
    StandardizationPipe,
    AmazonProvider,
    TargetProvider,
    MenardsProvider,
  ],
})
export class SearchModule {}
