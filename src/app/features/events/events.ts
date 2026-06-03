import { Component, inject, signal, computed, afterNextRender, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopService } from '../../core/services/workshop.service';
import { AuthService } from '../../core/auth/auth.service';
import { Workshop } from '../../core/models';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-events',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
  private workshopService = inject(WorkshopService);
  private confirmDialog = inject(ConfirmDialogService);
  auth = inject(AuthService);
  private router = inject(Router);
  private element = inject(ElementRef);

  workshops = signal<Workshop[]>([]);
  selectedWorkshop = signal<Workshop | null>(null);
  newWorkshop = signal<Partial<Workshop> | null>(null);
  editingWorkshop = signal<Partial<Workshop> | null>(null);
  signedUpIds = signal<Set<number>>(new Set());

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
      const { data } = await this.workshopService.getAllWorkshops();
      const ws = (data as Workshop[]) ?? [];
      this.workshops.set(ws);

      if (this.auth.isLoggedIn()) {
        const { data: signups } = await this.workshopService.getUserSignups(this.auth.user()!.id);
        this.signedUpIds.set(new Set((signups ?? []).map((s) => s.workshop_id)));
      }

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
        windowResize: () => this.calendar?.updateSize(),
        events: ws.map((w) => {
          const { bg, border } = this.getEventColor(w);
          return {
            id: String(w.id),
            title: w.title,
            date: w.date,
            backgroundColor: bg,
            borderColor: border,
            textColor: '#ffffff',
            extendedProps: w,
          };
        }),
        eventClick: (info) => {
          const w = info.event.extendedProps as Workshop;
          const live = this.workshops().find((ww) => ww.id === w.id) ?? w;
          this.selectedWorkshop.set(live);
          setTimeout(() => this.calendar?.updateSize(), 50);
        },
      });
      this.calendar.render();
    });
  }

  private getEventColor(w: Workshop): { bg: string; border: string } {
    if (this.isPast(w.date)) return { bg: '#9CA3AF', border: '#9CA3AF' };
    const count = w.signup_count ?? 0;
    const ratio = count / w.capacity;
    if (ratio >= 1)   return { bg: '#DC2626', border: '#DC2626' };
    if (ratio >= 0.8) return { bg: '#D97706', border: '#D97706' };
    return { bg: '#3B6934', border: '#3B6934' };
  }

  isFull(w: Workshop): boolean {
    return (w.signup_count ?? 0) >= w.capacity;
  }

  closePanel() {
    this.selectedWorkshop.set(null);
    this.newWorkshop.set(null);
    this.editingWorkshop.set(null);
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  startEditingWorkshop(w: Workshop) {
    this.selectedWorkshop.set(null);
    this.editingWorkshop.set({ ...w, date: w.date?.slice(0, 16) ?? '' });
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  async deleteWorkshop(w: Workshop) {
    const ok = await this.confirmDialog.confirm('Eliminar aquest taller? Aquesta acció no es pot desfer.', { danger: true });
    if (!ok) return;
    const { error } = await this.workshopService.deleteWorkshop(w.id);
    if (error) { await this.confirmDialog.alert('Error en eliminar el taller.'); return; }
    this.workshops.update(ws => ws.filter(ww => ww.id !== w.id));
    this.calendar?.getEventById(String(w.id))?.remove();
    this.closePanel();
  }

  async saveEditingWorkshop() {
    const data = this.editingWorkshop();
    if (!data?.id) return;
    const { data: updated } = await this.workshopService.updateWorkshop(data.id, data);
    if (updated) {
      this.workshops.update(ws => ws.map(w => w.id === updated.id ? updated : w));
      const calEvent = this.calendar?.getEventById(String(updated.id));
      calEvent?.setProp('title', updated.title);
      const { bg, border } = this.getEventColor(updated);
      calEvent?.setProp('backgroundColor', bg);
      calEvent?.setProp('borderColor', border);
    }
    this.editingWorkshop.set(null);
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  startNewWorkshop() {
    this.selectedWorkshop.set(null);
    this.newWorkshop.set({ title: '', description: '', date: '', location: '', capacity: 20, price: null });
    setTimeout(() => this.calendar?.updateSize(), 50);
  }

  async saveNewWorkshop() {
    const data = this.newWorkshop();
    if (!data?.title || !data.date) return;
    const { data: created } = await this.workshopService.createWorkshop(data);
    if (created) {
      this.workshops.update(ws => [...ws, created]);
      const { bg, border } = this.getEventColor(created);
      this.calendar?.addEvent({
        id: String(created.id),
        title: created.title,
        date: created.date,
        backgroundColor: bg,
        borderColor: border,
        textColor: '#ffffff',
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
      await this.workshopService.removeSignup(workshop.id, userId);
      this.signedUpIds.update((s) => {
        const newSet = new Set(s);
        newSet.delete(workshop.id);
        return newSet;
      });
      this.workshops.update(ws => ws.map(w => w.id === workshop.id
        ? { ...w, signup_count: Math.max((w.signup_count ?? 0) - 1, 0) }
        : w
      ));
    } else {
      await this.workshopService.addSignup(workshop.id, userId);
      this.signedUpIds.update(s => new Set([...s, workshop.id]));
      this.workshops.update(ws => ws.map(w => w.id === workshop.id
        ? { ...w, signup_count: (w.signup_count ?? 0) + 1 }
        : w
      ));
    }
    const updated = this.workshops().find(w => w.id === workshop.id);
    if (updated) {
      if (this.selectedWorkshop()?.id === workshop.id) this.selectedWorkshop.set(updated);
      const { bg, border } = this.getEventColor(updated);
      this.calendar?.getEventById(String(workshop.id))?.setProp('backgroundColor', bg);
      this.calendar?.getEventById(String(workshop.id))?.setProp('borderColor', border);
    }
  }
}
