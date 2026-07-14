export interface IConversationRepository {
  findActiveSession(userId: string, thirtyMinutesAgo: Date): Promise<any | null>;
  createSession(userId: string): Promise<any>;
  findConversationBySession(sessionId: string): Promise<any | null>;
  createConversation(sessionId: string): Promise<any>;
  saveMessage(conversationId: string, role: string, content: string): Promise<any>;
  saveIntentionAndEntities(
    messageId: string,
    name: string,
    confidence: number,
    entities: Array<{ type: string; value: string }>,
  ): Promise<any>;
  findHistoryByUser(userId: string, take: number): Promise<any[]>;
  findMessagesByConversation(conversationId: string, take: number): Promise<any[]>;
}
