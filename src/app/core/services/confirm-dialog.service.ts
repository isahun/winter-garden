import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger: boolean;
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly config = signal<DialogConfig | null>(null);

  confirm(message: string, options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean }): Promise<boolean> {
    return new Promise(resolve => {
      this.config.set({
        message,
        confirmLabel: options?.confirmLabel ?? 'Confirmar',
        cancelLabel: options?.cancelLabel ?? 'Cancel·lar',
        danger: options?.danger ?? false,
        resolve,
      });
    });
  }

  alert(message: string): Promise<void> {
    return new Promise(resolve => {
      this.config.set({
        message,
        confirmLabel: "D'acord",
        danger: false,
        resolve: () => resolve(),
      });
    });
  }

  close(confirmed: boolean): void {
    this.config()?.resolve(confirmed);
    this.config.set(null);
  }
}
