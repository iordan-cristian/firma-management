import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suchauftrag, SuchauftragUebersicht } from '../models/suchauftrag.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuchauftragService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/suchauftrag`;

  getUebersicht(): Observable<SuchauftragUebersicht[]> { return this.http.get<SuchauftragUebersicht[]>(`${this.baseUrl}/uebersicht`); }
  getById(id: string): Observable<Suchauftrag> { return this.http.get<Suchauftrag>(`${this.baseUrl}/${id}`); }
  create(s: Suchauftrag): Observable<Suchauftrag> { return this.http.post<Suchauftrag>(this.baseUrl, s); }
  update(id: string, s: Suchauftrag): Observable<Suchauftrag> { return this.http.put<Suchauftrag>(`${this.baseUrl}/${id}`, s); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
