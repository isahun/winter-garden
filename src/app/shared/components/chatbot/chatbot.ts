import { Component, inject, signal, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { resource } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
})
export class Chatbot {
  private chatService = inject(ChatService);

  open = signal(false);
  chatMessages = signal<ChatMessage[]>([
    {
      id: 'initial',
      text: "Hola! Sóc l'assessora de Secret Garden. Com puc ajudar-te?",
      isUser: false,
    },
  ]);
  userPrompt = '';
  private currentAiPrompt = signal('');

  aiResponse = resource({
    params: () => this.currentAiPrompt(),
    stream: async ({ params: prompt }) => {
      const data = signal<{ value: string } | { error: Error }>({ value: '' });
      if (!prompt) return data;

      const decoder = new TextDecoder('utf-8');

      try {
        const reader = await this.chatService.streamResponse(prompt);
        if (!reader) {
          throw new Error('No es va poder obtenir el lector del flux de resposta.');
        }

        for await (const chunk of this.readStream(reader)) {
          const chunkText = decoder.decode(chunk);
          data.update((prev) => {
            if ('value' in prev) {
              return { value: `${prev.value}${chunkText}` };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error durant el streaming:', error);
        data.set({ error: new Error("No es va poder connectar amb l'IA. Prova-ho més tard.") });
      }

      return data;
    },
  });

  private async *readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  }

  constructor() {
    effect(() => {
      const isLoading = this.aiResponse.isLoading();
      const value = this.aiResponse.value();
      if (!isLoading && value) {
        this.chatMessages.update((msgs) => [
          ...msgs,
          { id: `ai-${Date.now()}`, text: value, isUser: false },
        ]);
        untracked(() => this.currentAiPrompt.set(''));
      }
    });
  }

  sendMessage(): void {
    const prompt = this.userPrompt.trim();
    if (!prompt || this.aiResponse.isLoading()) return;

    this.chatMessages.update((msgs) => [
      ...msgs,
      { id: `user-${Date.now()}`, text: prompt, isUser: true },
    ]);

    this.userPrompt = '';
    this.currentAiPrompt.set(prompt);
  }
}
