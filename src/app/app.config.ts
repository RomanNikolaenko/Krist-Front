import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeUk from '@angular/common/locales/uk';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideAuthInitializer } from './core/auth/auth.initializer';
import { routes } from './app.routes';

/*
 * Month names, day names and the order they go in, for both languages the site
 * speaks. Angular bundles only the one locale it was built for; the `d` pipe
 * formats against whichever is being read, and cannot do that for data that is
 * not here.
 */
registerLocaleData(localeEn, 'en');
registerLocaleData(localeUk, 'uk');

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
      /*
       * 'enabled' rather than 'top': Back returns to where the reader was, not
       * to the start of the page. On a catalogue of forty-eight products,
       * opening the thirtieth and coming back to the top means finding it
       * again by hand.
       */
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
};
