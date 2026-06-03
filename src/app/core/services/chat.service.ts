import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {
  async streamResponse(prompt: string): Promise<ReadableStreamDefaultReader<Uint8Array> | undefined> {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      if (!response.body) return undefined;
      return response.body.getReader();
    } catch {
      return undefined;
    }
  }
}
