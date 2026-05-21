import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Workshop } from '../../../core/models';

@Component({
  selector: 'app-workshops',
  imports: [RouterLink, DatePipe],
  templateUrl: './workshops.html',
  styleUrl: './workshops.css',
})
export class Workshops implements OnInit {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);

  workshops = signal<Workshop[]>([]);

  async ngOnInit() {
    const { data } = await this.supabase
    .from('workshop_signups')
    .select('workshops(*)')
    .eq('user_id', this.auth.user()!.id)
    .order('created_at', { ascending: false });

    this.workshops.set((data ?? []).map(signup => signup.workshops as unknown as Workshop));
  }

  async cancelSignup(workshopId: number) {
    await this.supabase
    .from('workshop_signups')
    .delete()
    .eq('workshop_id', workshopId)
    .eq('user_id', this.auth.user()!.id);

    this.workshops.update(list => list.filter(workshop => workshop.id !== workshopId));
  }
}
