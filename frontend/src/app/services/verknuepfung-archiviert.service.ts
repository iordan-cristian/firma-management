import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VerknuepfungArchiviert } from '../models/verknuepfung.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VerknuepfungArchiviertService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/verknuepfung-archiviert`;

  get(kandidatId: string): Observable<VerknuepfungArchiviert[]> {
    return this.http.get<VerknuepfungArchiviert[]>(`${this.baseUrl}/kandidat/${kandidatId}`);
  }
}
