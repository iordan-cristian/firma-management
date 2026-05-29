import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly storageKey = 'firma_auth';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap(res => localStorage.setItem(this.storageKey, JSON.stringify(res))));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  get token(): string | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try { return (JSON.parse(raw) as LoginResponse).token; } catch { return null; }
  }

  get username(): string | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try { return (JSON.parse(raw) as LoginResponse).username; } catch { return null; }
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}
