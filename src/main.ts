import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideZoneChangeDetection } from '@angular/core';
// import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import '@luigi-project/container';

// import { init } from '@sentry/angular';

// if (!isDevMode()) {
//   init({
//     dsn: 'https://4460b9ee010f4d5486f124ac79b8ac33@o1240783.ingest.sentry.io/4508931443064841',
//   });
// }

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [provideZoneChangeDetection(), ...appConfig.providers],
}).catch((err) => {
  console.error(err);
});
