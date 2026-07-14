import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Verknuepfung, VerknuepfungKandidat } from '../models/verknuepfung.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VerknuepfungService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/verknuepfung`;

  create(v: Verknuepfung): Observable<Verknuepfung> { return this.http.post<Verknuepfung>(this.baseUrl, v); }
  getKandidatenForSuchauftrag(suchauftragId: string): Observable<VerknuepfungKandidat[]> {
    return this.http.get<VerknuepfungKandidat[]>(`${this.baseUrl}/suchauftrag/${suchauftragId}`);
  }
  deleteLink(suchauftragId: string, kandidatId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/suchauftrag/${suchauftragId}/kandidat/${kandidatId}`);
  }
}
