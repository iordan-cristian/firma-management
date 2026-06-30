import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KandidatDokument, DokumentTyp } from '../models/kandidat.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KandidatDokumentService {
  private http = inject(HttpClient);

  private url(kandidatId: string): string {
    return `${environment.apiUrl}/api/kandidat/${kandidatId}/dokumente`;
  }

  list(kandidatId: string): Observable<KandidatDokument[]> {
    return this.http.get<KandidatDokument[]>(this.url(kandidatId));
  }

  upload(kandidatId: string, file: File, dokumentTyp: DokumentTyp | ''): Observable<KandidatDokument> {
    const fd = new FormData();
    fd.append('file', file);
    if (dokumentTyp) fd.append('dokumentTyp', dokumentTyp);
    return this.http.post<KandidatDokument>(this.url(kandidatId), fd);
  }

  delete(kandidatId: string, docId: string): Observable<void> {
    return this.http.delete<void>(`${this.url(kandidatId)}/${docId}`);
  }

  downloadUrl(kandidatId: string, docId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.url(kandidatId)}/${docId}/download`);
  }
}
