import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <form class="login-card" (ngSubmit)="submit()">
        <h1>Firma Management</h1>
        <p class="hint">Default credentials: admin / admin</p>

        <label>
          Username
          <input type="text" [(ngModel)]="username" name="username" autocomplete="username" required />
        </label>

        <label>
          Password
          <input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" required />
        </label>

        <button type="submit" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>

        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1f2a44 0%, #2d3e63 100%);
    }
    .login-card {
      background: #fff;
      padding: 32px;
      border-radius: 12px;
      width: 360px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .hint { margin: 0; font-size: 13px; color: #666; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #333; }
    input {
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
    }
    button {
      margin-top: 6px;
      padding: 10px;
      background: #2d3e63;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }
    button:disabled { opacity: 0.6; }
    .error { color: #c0392b; margin: 0; font-size: 13px; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';

  submit(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 401 ? 'Invalid username or password' : 'Login failed';
      }
    });
  }
}
