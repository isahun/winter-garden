import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // withComponentInputBinding: permet passar params de ruta com a @Input() del component (sense ActivatedRoute)
      withComponentInputBinding(),
      // scrollPositionRestoration: torna al top en cada navegació (com un web tradicional)
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    // withEventReplay: durant la hidratació SSR, captura els events de l'usuari i els reprodueix un cop Angular arrenca
    provideClientHydration(withEventReplay()),
    // L'ordre dels interceptors importa: auth → error → loading (auth afegeix el token, error el gestiona, loading mesura el temps)
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])
    ),
  ],
};
