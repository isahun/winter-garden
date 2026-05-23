import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../../core/supabase.service';
import { Workshop, Store } from '../../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-events',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-events.html',
})
export class AdminEvents implements OnInit {
  private supabase = inject(SupabaseService).client;

  workshops = signal<Workshop[]>([]);
  stores = signal<Store[]>([]);
  editing = signal<Partial<Workshop> | null>(null);
  isNew = signal(false);

  async ngOnInit() {
    const [{ data: ws }, { data: st }] = await Promise.all([
      this.supabase.from('workshops').select('*').order('date'),
      this.supabase.from('stores').select('id, name'),
    ]);
    this.workshops.set(ws ?? []);
    this.stores.set(st ?? []);
  }

  createNewEventAdmin() {
    this.editing.set({ title: '', description: '', date: '', location: '', capacity: 20, price: null, difficulty: null, store_id: null });
    this.isNew.set(true);
  }

  editEventAdmin(w: Workshop) {
    this.editing.set({ ...w });
    this.isNew.set(false);
  }

  cancelEditAdmin() {
    this.editing.set(null);
  }

  async saveEventAdmin() {
    const data = this.editing();
    if (!data) return;
    if (this.isNew()) {
      await this.supabase.from('workshops').insert(data);
    } else {
      await this.supabase.from('workshops').update(data).eq('id', data.id!);
    }
    this.editing.set(null);
    await this.ngOnInit();
  }

  async deleteEventAdmin(id: number) {
    if (!confirm('Eliminar aquest taller?')) return;
    await this.supabase.from('workshops').delete().eq('id', id);
    await this.ngOnInit();
  }
}
