import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vertrag } from '../models/vertrag.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VertragService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/vertrag`;

  getAll(): Observable<Vertrag[]> { return this.http.get<Vertrag[]>(this.baseUrl); }
  getById(id: string): Observable<Vertrag> { return this.http.get<Vertrag>(`${this.baseUrl}/${id}`); }
  create(v: Vertrag): Observable<Vertrag> { return this.http.post<Vertrag>(this.baseUrl, v); }
  update(id: string, v: Vertrag): Observable<Vertrag> { return this.http.put<Vertrag>(`${this.baseUrl}/${id}`, v); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
