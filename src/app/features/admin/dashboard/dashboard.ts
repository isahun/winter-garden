import { Component, inject, afterNextRender, ElementRef } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private supabase = inject(SupabaseService).client;
  private element = inject(ElementRef);

  constructor() {
    afterNextRender(async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const { data: orders } = await this.supabase
        .from('orders')
        .select('total, status, created_at');

      const monthly = Array(12).fill(0);
      (orders ?? []).forEach((order) => {
        const month = new Date(order.created_at).getMonth();
        monthly[month] += order.total;
      });

      const statusCount = { pending: 0, shipped: 0, completed: 0, cancelled: 0 };

      (orders ?? []).forEach((order) => statusCount[order.status as keyof typeof statusCount]++);

      const salesCanvas = this.element.nativeElement.querySelector('#sales-chart');
      new Chart(salesCanvas, {
        type: 'bar',
        data: {
          labels: [
            'Gen',
            'Feb',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Oct',
            'Nov',
            'Des',
          ],
          datasets: [{ label: 'Vendes (€)', data: monthly, backgroundColor: '#4ade80' }],
        },
        options: { responsive: true },
      });

      const statusCanvas = this.element.nativeElement.querySelector('#status-chart');
      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Pendent', 'Enviat', 'Completat', 'Cancel·lat'],
          datasets: [
            {
              data: Object.values(statusCount),
              backgroundColor: ['#facc15', '#60a5fa', '#4ade80', '#f87171'],
            },
          ],
        },
        options: { responsive: true },
      });
    });
  }
}
