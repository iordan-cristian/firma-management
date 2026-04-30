import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ShellComponent } from './components/shell/shell.component';
import { LandingComponent } from './components/landing/landing.component';
import { FirmenComponent } from './components/firmen/firmen.component';
import { SuchauftraegeComponent } from './components/suchauftraege/suchauftraege.component';
import { VertraegeComponent } from './components/vertraege/vertraege.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: LandingComponent },
      { path: 'firmen', component: FirmenComponent },
      { path: 'suchauftraege', component: SuchauftraegeComponent },
      { path: 'vertraege', component: VertraegeComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
