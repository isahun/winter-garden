import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  sending = signal(false);
  sent    = signal(false);

  async submit() {
    if (this.form.invalid) return;
    this.sending.set(true);
    await new Promise(r => setTimeout(r, 900));
    this.sending.set(false);
    this.sent.set(true);
  }
}
