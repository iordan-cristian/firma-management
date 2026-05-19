import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <main class="main"><router-outlet></router-outlet></main>

      <aside class="sidenav">
        <div class="brand">
          <div class="brand-title">Firma Management</div>
          <div class="brand-user">{{ auth.username }}</div>
        </div>

        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/firmen" routerLinkActive="active">Firmen</a>
          <a routerLink="/vertraege" routerLinkActive="active">Verträge</a>
          <a routerLink="/kandidaten" routerLinkActive="active">Kandidaten</a>
        </nav>

        <button class="logout" (click)="logout()">Logout</button>
      </aside>
    </div>
  `,
  styles: [`
    .shell {
      display: grid;
      grid-template-columns: 1fr 260px;
      min-height: 100vh;
    }
    .main {
      padding: 24px 32px;
      overflow: auto;
    }
    .sidenav {
      background: #1f2a44;
      color: #f0f2f7;
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: -2px 0 8px rgba(0,0,0,0.08);
    }
    .brand-title { font-size: 16px; font-weight: 700; }
    .brand-user { font-size: 12px; color: #b8bfd1; margin-top: 2px; }
    nav { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    nav a {
      padding: 10px 12px;
      border-radius: 6px;
      color: #d8dde9;
      font-size: 14px;
      transition: background 0.15s;
    }
    nav a:hover { background: rgba(255,255,255,0.06); }
    nav a.active { background: #2d3e63; color: #fff; font-weight: 600; }
    .logout {
      margin-top: auto;
      background: transparent;
      color: #d8dde9;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    .logout:hover { background: rgba(255,255,255,0.06); }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
