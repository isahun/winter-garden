import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);
  // Comptador en lloc de boolean perquè poden haver-hi diverses peticions HTTP simultànies:
  // loading no s'oculta fins que TOTES han acabat (count torna a 0)
  private count = 0;

  show() { this.count++; this.isLoading.set(true); }
  hide() { if (--this.count <= 0) { this.count = 0; this.isLoading.set(false); } }
}
