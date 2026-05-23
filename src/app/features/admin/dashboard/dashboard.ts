import { Component, inject, afterNextRender, ElementRef, signal } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private supabase = inject(SupabaseService).client;
  private element = inject(ElementRef);

  totalRevenue = signal(0);
  totalOrders = signal(0);
  activeProducts = signal(0);

  constructor() {
    afterNextRender(async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const { data: orders } = await this.supabase
        .from('orders')
        .select('total, status, created_at');

      this.totalOrders.set((orders ?? []).length);
      this.totalRevenue.set(
        (orders ?? [])
          .filter((order) => order.status !== 'cancelled')
          .reduce((sum, order) => sum + order.total, 0),
      );

      const { count } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gt('stock', 0);

      this.activeProducts.set(count ?? 0);

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
