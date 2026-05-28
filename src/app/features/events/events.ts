import { Component, inject, signal, computed, afterNextRender, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';
import { AuthService } from '../../core/auth/auth.service';
import { Workshop } from '../../core/models';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-events',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
  private supabase = inject(SupabaseService).client;
  auth = inject(AuthService);
  private router = inject(Router);
  private element = inject(ElementRef);

  workshops = signal<Workshop[]>([]);
  selectedWorkshop = signal<Workshop | null>(null);
  newWorkshop = signal<Partial<Workshop> | null>(null);
  signedUpIds = signal<Set<number>>(new Set());
  workshopSignupCount = signal<number | null>(null);

  currentMonth = signal(new Date());
  monthLabel = computed(() =>
    this.currentMonth().toLocaleDateString('ca', { month: 'long', year: 'numeric' }),
  );
  workshopsForMonth = computed(() => {
    const month = this.currentMonth();
    return this.workshops().filter((workshop) => {
      const date = new Date(workshop.date);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    });
  });

  private calendar: any = null;

  constructor() {
    afterNextRender(async () => {
      const { data } = await this.supabase.from('workshops').select('*').order('date');
      const ws = (data as Workshop[]) ?? [];
      this.workshops.set(ws);

      if (this.auth.isLoggedIn()) {
        const { data: signups } = await this.supabase
          .from('workshop_signups')
          .select('workshop_id')
          .eq('user_id', this.auth.user()!.id);
        this.signedUpIds.set(new Set((signups ?? []).map((s) => s.workshop_id)));
      }

      if (window.innerWidth < 768) return;

      const { Calendar } = await import('@fullcalendar/core');
      const { default: dayGridPlugin } = await import('@fullcalendar/daygrid');
      const { default: interactionPlugin } = await import('@fullcalendar/interaction');
      const { default: caLocale } = await import('@fullcalendar/core/locales/ca');

      const calendarEl = this.element.nativeElement.querySelector('#calendar');
      if (!calendarEl) return;

      this.calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: caLocale,
        displayEventTime: false,
        events: ws.map((w) => ({
          id: String(w.id),
          title: w.title,
          date: w.date,
          extendedProps: w,
        })),
        eventClick: (info) => {
          const w = info.event.extendedProps as Workshop;
          this.selectedWorkshop.set(w);
          if (this.auth.isAdmin()) this.loadWorkshopCount(w.id);
          setTimeout(() => this.calendar?.updateSize(), 50);
        },
      });
      this.calendar.render();
    });
  }

  closePanel() {
    this.selectedWorkshop.set(null);
    this.newWorkshop.set(null);
    this.workshopSignupCount.set(null);
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  async loadWorkshopCount(workshopId: number) {
    this.workshopSignupCount.set(null);
    const { count } = await this.supabase
      .from('workshop_signups')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId);
    this.workshopSignupCount.set(count ?? 0);
  }

  startNewWorkshop() {
    this.selectedWorkshop.set(null);
    this.newWorkshop.set({ title: '', description: '', date: '', location: '', capacity: 20, price: null });
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  async saveNewWorkshop() {
    const data = this.newWorkshop();
    if (!data?.title || !data.date) return;
    const { data: created } = await this.supabase
      .from('workshops')
      .insert(data)
      .select()
      .single<Workshop>();
    if (created) {
      this.workshops.update(ws => [...ws, created]);
      this.calendar?.addEvent({
        id: String(created.id),
        title: created.title,
        date: created.date,
        extendedProps: created,
      });
    }
    this.newWorkshop.set(null);
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  prevMonth() {
    this.currentMonth.update((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }

  nextMonth() {
    this.currentMonth.update((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  isSignedUp(workshopId: number) {
    return this.signedUpIds().has(workshopId);
  }

  isPast(date: string) {
    return new Date(date) < new Date();
  }

  async toggleSignup(workshop: Workshop) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const userId = this.auth.user()!.id;
    if (this.isSignedUp(workshop.id)) {
      await this.supabase
        .from('workshop_signups')
        .delete()
        .eq('workshop_id', workshop.id)
        .eq('user_id', userId);
      this.signedUpIds.update((signedupId) => {
        const newSet = new Set(signedupId);
        newSet.delete(workshop.id);
        return newSet;
      });
    } else {
      await this.supabase
        .from('workshop_signups')
        .insert({ workshop_id: workshop.id, user_id: userId });
        this.signedUpIds.update(s => new Set([...s, workshop.id]));
    }

  }
}
