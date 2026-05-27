import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WorkshopService } from '../../../core/services/workshop.service';
import { Workshop } from '../../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-events',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-events.html',
})
export class AdminEvents implements OnInit {
  private workshopService = inject(WorkshopService);

  workshops = signal<Workshop[]>([]);
  editing = signal<Partial<Workshop> | null>(null);
  isNew = signal(false);

  async ngOnInit() {
    const { data } = await this.workshopService.getAllWorkshops();
    this.workshops.set(data ?? []);
  }

  createNewEventAdmin() {
    this.editing.set({ title: '', description: '', date: '', location: '', capacity: 20 });
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
}
