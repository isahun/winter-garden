import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = signal('');
  loading = signal(false);

  async submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { name, email, password } = this.form.value;
    const { error } = await this.auth.register(email!, password!, name!);

    if(error) {
      this.error.set(error.message);
    } else {
      this.router.navigate(['/auth/login']);
    }
    this.loading.set(false);
  }

}
