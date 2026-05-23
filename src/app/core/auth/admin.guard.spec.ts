import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { AuthService } from './auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let isAdminSignal: WritableSignal<boolean>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

  beforeEach(() => {
    isAdminSignal = signal(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAdmin: isAdminSignal } },
        { provide: Router, useValue: { createUrlTree: (commands: any[]) => commands } },
      ],
    });
  });

  it('Given usuari no admin, When accedeix a /admin, Then redirigeix a /', () => {
    isAdminSignal.set(false);
    const result = runGuard();
    expect(result).not.toBe(true);
  });

  it('Given admin loguejat, When accedeix a /admin, Then permet l\'accés', () => {
    isAdminSignal.set(true);
    expect(runGuard()).toBe(true);
  });
});
