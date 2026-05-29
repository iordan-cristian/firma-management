import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Firma } from '../models/firma.model';
import { Ansprechpartner } from '../models/ansprechpartner.model';
import { Suchauftrag } from '../models/suchauftrag.model';
import { Vertrag } from '../models/vertrag.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirmaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/firma`;

  getAll(): Observable<Firma[]> { return this.http.get<Firma[]>(this.baseUrl); }
  getById(id: string): Observable<Firma> { return this.http.get<Firma>(`${this.baseUrl}/${id}`); }
  create(f: Firma): Observable<Firma> { return this.http.post<Firma>(this.baseUrl, f); }
  update(id: string, f: Firma): Observable<Firma> { return this.http.put<Firma>(`${this.baseUrl}/${id}`, f); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }

  getAnsprechpartnerForFirma(id: string): Observable<Ansprechpartner[]> {
    return this.http.get<Ansprechpartner[]>(`${this.baseUrl}/${id}/ansprechpartner`);
  }
  getSuchauftragForFirma(id: string): Observable<Suchauftrag[]> {
    return this.http.get<Suchauftrag[]>(`${this.baseUrl}/${id}/suchauftrag`);
  }
  getVertragForFirma(id: string): Observable<Vertrag[]> {
    return this.http.get<Vertrag[]>(`${this.baseUrl}/${id}/vertrag`);
  }
}
