import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideAuthInitializer } from './core/auth/auth.initializer';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    /*
     * The interceptor puts credentials and the CSRF header on API calls, and
     * only those — the icon registry pulls svg/* through this same client.
     */
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // Resolve the session before the first route renders, so nothing decides
    // what to show while the answer is still unknown.
    provideAuthInitializer(),

    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
  ],
};
