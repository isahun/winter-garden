import { Component, inject, afterNextRender, ElementRef, signal, computed, effect } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Chart as ChartJS } from 'chart.js';
type OrderStat = { id: number; total: number; status: 'pending' | 'shipped' | 'completed' | 'cancelled'; created_at: string };

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private element = inject(ElementRef);

  private salesChart: ChartJS | null = null;
  private allOrders: OrderStat[] = [];

  totalRevenue = signal(0);
  totalOrders = signal(0);
  activeProducts = signal(0);
  loadError = signal(false);
  hasTopProducts = signal(false);

  private readonly currentYear = new Date().getFullYear();
  selectedYear = signal(this.currentYear);
  minYear = signal(this.currentYear - 2);

  canGoPrev = computed(() => this.selectedYear() > this.minYear());
  canGoNext = computed(() => this.selectedYear() < this.currentYear);

  prevYear() { this.selectedYear.update(y => y - 1); }
  nextYear() { this.selectedYear.update(y => y + 1); }

  constructor() {
    effect(() => {
      const year = this.selectedYear();
      if (this.salesChart) this.updateSalesChart(year);
    });

    afterNextRender(async () => {
      try {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        const { data: orders } = await this.dashboardService.getOrderStats();
        const { count } = await this.dashboardService.getActiveProductsCount();

        this.allOrders = orders ?? [];
        this.totalOrders.set(this.allOrders.length);
        this.totalRevenue.set(
          this.allOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0),
        );
        this.activeProducts.set(count ?? 0);

        if (this.allOrders.length) {
          const earliest = Math.min(...this.allOrders.map(o => new Date(o.created_at).getFullYear()));
          this.minYear.set(Math.min(earliest, this.currentYear - 2));
        }

        const statusCount = { pending: 0, shipped: 0, completed: 0, cancelled: 0 };
        this.allOrders.forEach(o => statusCount[o.status as keyof typeof statusCount]++);

        const salesCanvas = this.element.nativeElement.querySelector('#sales-chart');
        this.salesChart = new Chart(salesCanvas, {
          type: 'bar',
          data: {
            labels: ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'],
            datasets: [{ label: 'Vendes (€)', data: this.monthlyData(this.selectedYear()), backgroundColor: '#4ade80' }],
          },
          options: { responsive: true },
        });

        const statusCanvas = this.element.nativeElement.querySelector('#status-chart');
        new Chart(statusCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Pendent', 'Enviat', 'Completat', 'Cancel·lat'],
            datasets: [{ data: Object.values(statusCount), backgroundColor: ['#facc15', '#60a5fa', '#4ade80', '#f87171'] }],
          },
          options: { responsive: true },
        });

        type TopProductRow = {
          order_items: Array<{ quantity: number; products: Array<{ name: string }> }> | null;
        };
        const { data: rawTopOrders } = await this.dashboardService.getTopProducts();
        const qtyByProduct: Record<string, number> = {};
        ((rawTopOrders ?? []) as unknown as TopProductRow[]).forEach(order => {
          (order.order_items ?? []).forEach(item => {
            const name = item.products?.[0]?.name;
            if (name) qtyByProduct[name] = (qtyByProduct[name] ?? 0) + item.quantity;
          });
        });
        const top5 = Object.entries(qtyByProduct)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        this.hasTopProducts.set(top5.length > 0);
        if (top5.length === 0) return;

        const topCanvas = this.element.nativeElement.querySelector('#top-products-chart');
        new Chart(topCanvas, {
          type: 'bar',
          data: {
            labels: top5.map(([name]) => name),
            datasets: [{ label: 'Unitats venudes', data: top5.map(([, qty]) => qty), backgroundColor: '#86efac' }],
          },
          options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { stepSize: 1 } } },
          },
        });
      } catch {
        this.loadError.set(true);
      }
    });
  }

  private monthlyData(year: number): number[] {
    const monthly = Array(12).fill(0);
    this.allOrders
      .filter(o => new Date(o.created_at).getFullYear() === year && o.status !== 'cancelled')
      .forEach(o => { monthly[new Date(o.created_at).getMonth()] += o.total; });
    return monthly;
  }

  private updateSalesChart(year: number) {
    if (!this.salesChart) return;
    this.salesChart.data.datasets[0].data = this.monthlyData(year);
    this.salesChart.update();
  }
}
