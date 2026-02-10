import { Routes } from '@angular/router'
import { Home } from './home/home'
import { Login } from './login/login'
import { Register } from './register/register'
import { Profile } from './profile/profile'
import { Mission } from './mission/mission'
import { ServerError } from './server-error/server-error'
import { NotFound } from './not-found/not-found'
import { authGuard } from './_guard/auth-guard'
import { logoutGuard } from './_guard/logout-guard'

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'mission', component: Mission, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: 'server-error', component: ServerError },
    { path: 'logout', canActivate: [logoutGuard], component: Home },
    { path: '**', component: NotFound },
]
