import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  auth = inject(AuthService);
}
