import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { NgxSpinnerModule } from 'ngx-spinner'

import { routes } from './app.routes'
import { loadingInterceptor } from './_interceptors/loading-interceptor'
import { authInterceptor } from './_interceptors/auth-interceptor'

import { provideFirebaseApp, initializeApp } from '@angular/fire/app'
import { provideAuth, getAuth } from '@angular/fire/auth'
import { provideFirestore, getFirestore } from '@angular/fire/firestore'
import { provideStorage, getStorage } from '@angular/fire/storage'
import { environment } from '../environments/environment'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor])),
    importProvidersFrom(NgxSpinnerModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
}
