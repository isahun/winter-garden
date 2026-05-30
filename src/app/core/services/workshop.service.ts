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
    return this.supabase.from('workshops').insert(workshop).select().single<Workshop>();
  }

  async updateWorkshop(id: number, workshop: Partial<Workshop>) {
    return this.supabase.from('workshops').update(workshop).eq('id', id).select().single<Workshop>();
  }

  async deleteWorkshop(id: number) {
    return this.supabase.from('workshops').delete().eq('id', id);
  }

  async getUserSignups(userId: string) {
    return this.supabase.from('workshop_signups').select('workshop_id').eq('user_id', userId);
  }

  async addSignup(workshopId: number, userId: string) {
    return this.supabase
      .from('workshop_signups')
      .insert({ workshop_id: workshopId, user_id: userId });
  }

  async removeSignup(workshopId: number, userId: string) {
    return this.supabase
      .from('workshop_signups')
      .delete()
      .eq('workshop_id', workshopId)
      .eq('user_id', userId);
  }
}
