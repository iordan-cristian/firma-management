import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ansprechpartner } from '../models/ansprechpartner.model';
import { Vertrag } from '../models/vertrag.model';

@Injectable({ providedIn: 'root' })
export class AnsprechpartnerService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/ansprechpartner';

  getAll(): Observable<Ansprechpartner[]> { return this.http.get<Ansprechpartner[]>(this.baseUrl); }
  getById(id: string): Observable<Ansprechpartner> { return this.http.get<Ansprechpartner>(`${this.baseUrl}/${id}`); }
  create(a: Ansprechpartner): Observable<Ansprechpartner> { return this.http.post<Ansprechpartner>(this.baseUrl, a); }
  update(id: string, a: Ansprechpartner): Observable<Ansprechpartner> { return this.http.put<Ansprechpartner>(`${this.baseUrl}/${id}`, a); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }

  getVertragForAnsprechpartner(id: string): Observable<Vertrag[]> {
    return this.http.get<Vertrag[]>(`${this.baseUrl}/${id}/vertrag`);
  }
}
