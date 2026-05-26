import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Workshop } from '../models';

@Injectable({ providedIn: 'root' })
export class WorkshopService {
  private supabase = inject(SupabaseService).client;

  async getAllWorkshops() {
    return this.supabase.from('workshops').select('*').order('date');
  }

  async createWorkshop(workshop: Partial<Workshop>) {
    return this.supabase.from('workshops').insert(workshop);
  }

  async updateWorkshop(id: number, workshop: Partial<Workshop>) {
    return this.supabase.from('workshops').update(workshop).eq('id', id);
  }

  async deleteWorkshop(id: number) {
    return this.supabase.from('workshops').delete().eq('id', id);
  }
}
