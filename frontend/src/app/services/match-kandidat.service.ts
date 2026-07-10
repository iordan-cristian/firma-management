import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kandidat } from '../models/kandidat.model';
import { environment } from '../../environments/environment';

export interface MatchKandidatRequest {
  suchauftragId: string;
}

@Injectable({ providedIn: 'root' })
export class MatchKandidatService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/match-kandidat`;

  matchKandidat(request: MatchKandidatRequest): Observable<Kandidat[]> {
    const params = new HttpParams().set('suchauftragId', request.suchauftragId);
    return this.http.get<Kandidat[]>(this.baseUrl, { params });
  }
}