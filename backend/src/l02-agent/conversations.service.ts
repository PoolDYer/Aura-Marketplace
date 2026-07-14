import { Injectable, Logger, Inject } from '@nestjs/common';
import { IConversationRepository } from '../l04-domain/ports/conversation-repository.interface';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @Inject('IConversationRepository') private readonly conversationRepo: IConversationRepository,
  ) {}

  async getOrCreateActiveSession(userId: string) {
    // Search for a recent session (e.g., created or updated in the last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    let session = await this.conversationRepo.findActiveSession(userId, thirtyMinutesAgo);

    if (!session) {
      this.logger.log(`Creating new session for user ${userId}`);
      session = await this.conversationRepo.createSession(userId);
    }

    // Get or create conversation for the session
    let conversation = await this.conversationRepo.findConversationBySession(session.id);

    if (!conversation) {
      conversation = await this.conversationRepo.createConversation(session.id);
    }

    return { session, conversation };
  }

  async saveMessage(conversationId: string, role: 'USER' | 'AGENT' | 'SYSTEM', content: string) {
    return this.conversationRepo.saveMessage(conversationId, role, content);
  }

  async saveIntentionAndEntities(mensajeId: string, intentionData: any) {
    if (!intentionData) return null;

    return this.conversationRepo.saveIntentionAndEntities(
      mensajeId,
      intentionData.intent || 'unknown',
      intentionData.confidence || 0,
      intentionData.entities || [],
    );
  }

  async getConversationHistory(userId: string) {
    return this.conversationRepo.findHistoryByUser(userId, 10);
  }
}
