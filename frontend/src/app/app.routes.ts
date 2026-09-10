import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ShellComponent } from './components/shell/shell.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FirmenComponent } from './components/firmen/firmen.component';
import { VertraegeComponent } from './components/vertraege/vertraege.component';
import { KandidatenComponent } from './components/kandidaten/kandidaten.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'firmen', component: FirmenComponent },
      { path: 'vertraege', component: VertraegeComponent },
      { path: 'kandidaten', component: KandidatenComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
