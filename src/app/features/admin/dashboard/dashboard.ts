import { Component, inject, afterNextRender, ElementRef, signal } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private element = inject(ElementRef);

  totalRevenue = signal(0);
  totalOrders = signal(0);
  activeProducts = signal(0);
  loadError = signal(false);

  constructor() {
    afterNextRender(async () => {
      try {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        const { data: orders } = await this.dashboardService.getOrderStats();
        const { count } = await this.dashboardService.getActiveProductsCount();

        this.totalOrders.set((orders ?? []).length);
        this.totalRevenue.set(
          (orders ?? [])
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0),
        );
        this.activeProducts.set(count ?? 0);

        const monthly = Array(12).fill(0);
        (orders ?? []).forEach((o) => {
          const month = new Date(o.created_at).getMonth();
          monthly[month] += o.total;
        });

        const statusCount = { pending: 0, shipped: 0, completed: 0, cancelled: 0 };
        (orders ?? []).forEach((o) => statusCount[o.status as keyof typeof statusCount]++);

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
      } catch (err) {
        console.error('[Dashboard] Error carregant dades:', err);
        this.loadError.set(true);
      }
    });
  }
}
