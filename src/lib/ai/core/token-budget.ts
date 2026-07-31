export class TokenBudgetManager {
  /**
   * Extremely simple estimation of token count.
   * In a real system, we'd use a tokenizer like `tiktoken`.
   * Approx 4 chars = 1 token.
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Trims the conversation history to fit within a specific budget.
   * Always keeps the system prompt and the latest user message.
   * Trims the oldest messages in the middle.
   */
  static compressHistory(
    messages: { role: 'system' | 'user' | 'assistant'; content: string | any[] }[],
    maxBudget: number
  ): { role: 'system' | 'user' | 'assistant'; content: string | any[] }[] {
    
    let currentTokens = messages.reduce((acc, msg) => acc + this.estimateTokens(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)), 0);
    
    if (currentTokens <= maxBudget) {
      return messages;
    }

    const compressed = [...messages];
    
    // We cannot trim the first message (system prompt) or the last message (current user query)
    let i = 1;
    while (currentTokens > maxBudget && i < compressed.length - 1) {
      const tokensRemoved = this.estimateTokens(typeof compressed[i].content === 'string' ? compressed[i].content as string : JSON.stringify(compressed[i].content));
      currentTokens -= tokensRemoved;
      compressed.splice(i, 1);
    }

    return compressed;
  }
}
