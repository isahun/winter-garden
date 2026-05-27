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
  // Canviar aquest signal dispara la crida a resource() — és el mecanisme per enviar un nou prompt
  private currentAiPrompt = signal('');

  // resource() és l'API experimental d'Angular per gestionar dades asíncrones reactives
  // La variant `stream` permet actualitzar progressivament un signal intern mentre arriben chunks
  aiResponse = resource({
    // params() defineix la dependència reactiva: resource es re-executa cada cop que currentAiPrompt canvia
    params: () => this.currentAiPrompt(),
    stream: async ({ params: prompt }) => {
      // data és el signal intern que resource() exposa via .value() — comencem amb string buit
      const data = signal<{ value: string } | { error: Error }>({ value: '' });
      if (!prompt) return data;

      // TextDecoder converteix els chunks binaris (Uint8Array) que vénen del ReadableStream a text
      const decoder = new TextDecoder('utf-8');

      try {
        const reader = await this.chatService.streamResponse(prompt);
        if (!reader) {
          throw new Error('No es va poder obtenir el lector del flux de resposta.');
        }

        // readStream és un async generator — yield per cada chunk fins que l'stream acaba
        for await (const chunk of this.readStream(reader)) {
          const chunkText = decoder.decode(chunk);
          data.update((prev) => {
            // Només acumulem si estem en estat { value } — si hi ha error no sobreescribim
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

  // Async generator: wraps la API de ReadableStream (que és callback-based) en un for-await net
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
        // untracked() evita un bucle infinit: resettejar currentAiPrompt dins d'un effect
        // que dep de aiResponse (que dep de currentAiPrompt) causaria re-execucions infinites
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
