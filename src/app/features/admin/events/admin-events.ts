import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WorkshopService } from '../../../core/services/workshop.service';
import { Workshop } from '../../../core/models';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

interface WorkshopSignupRow {
  user_id: string;
  profiles: { name: string | null; email: string | null } | null;
}

@Component({
  selector: 'app-admin-events',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-events.html',
})
export class AdminEvents implements OnInit {
  private workshopService = inject(WorkshopService);
  private supabase = inject(SupabaseService).client;

  workshops = signal<Workshop[]>([]);
  editing = signal<Partial<Workshop> | null>(null);
  isNew = signal(false);
  signups = signal<Map<number, WorkshopSignupRow[]>>(new Map());
  dateFilter = signal<'all' | 'upcoming' | 'past'>('all');

  filtered = computed(() => {
    const now = new Date().toISOString();
    const filter = this.dateFilter();
    if (filter === 'upcoming') return this.workshops().filter((w) => w.date >= now);
    if (filter === 'past') return this.workshops().filter((w) => w.date < now);
    return this.workshops();
  });

  async ngOnInit() {
    const { data } = await this.workshopService.getAllWorkshops();
    this.workshops.set(data ?? []);
  }

  createNewEventAdmin() {
    this.editing.set({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 20,
      price: null,
    });
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
      await this.workshopService.createWorkshop(data);
    } else {
      await this.workshopService.updateWorkshop(data.id!, data);
    }
    this.editing.set(null);
    await this.ngOnInit();
  }

  async deleteEventAdmin(id: number) {
    if (!confirm('Eliminar aquest taller?')) return;
    await this.workshopService.deleteWorkshop(id);
    await this.ngOnInit();
  }

  async loadSignups(workshopId: number) {
    if (this.signups().has(workshopId)) return;
    const { data: rows } = await this.supabase
      .from('workshop_signups')
      .select('user_id')
      .eq('workshop_id', workshopId);
    if (!rows || rows.length === 0) {
      this.signups.update((map) => {
        const next = new Map(map);
        next.set(workshopId, []);
        return next;
      });
      return;
    }
    const userIds = rows.map((r) => r.user_id);
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const result: WorkshopSignupRow[] = rows.map((r) => ({
      user_id: r.user_id,
      profiles: profileMap.get(r.user_id) ?? null,
    }));
    this.signups.update((map) => {
      const next = new Map(map);
      next.set(workshopId, result);
      return next;
    });
  }

  getSignups(workshopId: number): WorkshopSignupRow[] {
    return this.signups().get(workshopId) ?? [];
  }
}
