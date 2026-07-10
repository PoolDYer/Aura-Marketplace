import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { ConversationsService } from './conversations.service';
import { AgentController } from '../l01-presentation/agent/agent.controller';
import { GeminiLanguageModelProvider } from '../l05-infrastructure/ai/gemini-ai.providers';
import { GeminiSpeechToTextProvider } from '../l05-infrastructure/ai/gemini-stt.provider';
import {
  MockTextToSpeechProvider
} from '../l05-infrastructure/ai/mock-ai.providers';
import { PrismaService } from '../l05-infrastructure/database/prisma.service';
import { ProductsService } from '../l03-application/products/products.service';
import { InfrastructureModule } from '../l05-infrastructure/infrastructure.module';

@Module({
  imports: [ConfigModule, InfrastructureModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    ConversationsService,
    PrismaService,
    ProductsService,
    {
      provide: 'LanguageModelProvider',
      useClass: GeminiLanguageModelProvider
    },
    {
      provide: 'SpeechToTextProvider',
      useClass: GeminiSpeechToTextProvider
    },
    {
      provide: 'TextToSpeechProvider',
      useClass: MockTextToSpeechProvider
    }
  ],
  exports: [AgentService]
})
export class AgentModule {}
