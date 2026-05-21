import { Component, inject, afterNextRender } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';
import { Store } from '../../core/models';

@Component({
  selector: 'app-stores',
  imports: [],
  templateUrl: './stores.html',
  styleUrl: './stores.css',
})
export class Stores {
  private supabase = inject(SupabaseService).client;

  constructor() {
    afterNextRender(async () => {
      const L = await import('leaflet');
      const map = L.map('map').setView([41.3851, 2.1734], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const { data } = await this.supabase.from('stores').select('*');
      (data as Store[])?.forEach((store) => {
        L.marker([store.lat, store.lng])
          .addTo(map)
          .bindPopup(`<b>${store.name}</b><br>${store.address}<br>${store.schedule ?? ''}`);
      });
    });
  }
}
