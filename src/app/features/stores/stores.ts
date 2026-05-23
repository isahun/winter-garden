import { Component, inject, signal, afterNextRender } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';
import { Store } from '../../core/models';
import type { Map as LeafletMap, Marker } from 'leaflet';

@Component({
  selector: 'app-stores',
  imports: [],
  templateUrl: './stores.html',
  styleUrl: './stores.css',
})
export class Stores {
  private supabase = inject(SupabaseService).client;

  stores = signal<Store[]>([]);
  selectedStoreId = signal<number | null>(null);

  private mapRef: LeafletMap | null = null;
  private markers = new Map<number, Marker>();

  constructor() {
    afterNextRender(async () => {
      const L = await import('leaflet');
      const map = L.map('map').setView([41.3851, 2.1734], 13);
      this.mapRef = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const { data } = await this.supabase.from('stores').select('*');
      const storeList = (data as Store[]) ?? [];
      this.stores.set(storeList);

      storeList.forEach((store) => {
        const marker = L.marker([store.lat, store.lng])
          .addTo(map)
          .bindPopup(`<b>${store.name}</b><br>${store.address}${store.schedule ? '<br>' + store.schedule : ''}`);

        marker.on('click', () => this.selectStore(store.id, false));
        this.markers.set(store.id, marker);
      });

      map.on('popupclose', () => this.selectedStoreId.set(null));
    });
  }

  selectStore(id: number, flyFromCard = true) {
    if (this.selectedStoreId() === id) {
      this.selectedStoreId.set(null);
      this.mapRef?.closePopup();
      return;
    }

    this.selectedStoreId.set(id);
    const store = this.stores().find((s) => s.id === id);
    if (!store) return;

    if (flyFromCard && this.mapRef) {
      this.mapRef.flyTo([store.lat, store.lng], 15, { duration: 0.8 });
    }
    this.markers.get(id)?.openPopup();

    document
      .getElementById(`store-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
