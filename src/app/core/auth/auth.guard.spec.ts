import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let isLoggedInSignal: WritableSignal<boolean>;

  const runGuard = () => TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

  beforeEach(() => {
    isLoggedInSignal = signal(false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: isLoggedInSignal,
            ready: Promise.resolve(),
          },
        },
        { provide: Router, useValue: { createUrlTree: (commands: any[]) => commands } },
      ],
    });
  });

  it('Given usuari no loguejat, When accedeix a ruta protegida, Then redirigeix a /auth/login', async () => {
    isLoggedInSignal.set(false);
    const result = await runGuard();
    expect(result).not.toBe(true);
  });

  it("Given usuari loguejat, When accedeix a ruta protegida, Then permet l'accés", async () => {
    isLoggedInSignal.set(true);
    const result = await runGuard();
    expect(result).toBe(true);
  });
});
