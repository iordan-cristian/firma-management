import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suchauftrag } from '../models/suchauftrag.model';
import { environment } from '../../environments/environment';

export interface MatchSuchauftragRequest {
  kandidatId: string;
}

export interface MatchSuchauftragResult {
  suchauftrag: Suchauftrag;
  score: number;
  satisfiedKriterien: string;
  unsatisfiedKriterien: string;
}

export interface MatchSuchauftragResponse {
  kriterienExplained: string;
  maxScore: number;
  results: MatchSuchauftragResult[];
}

@Injectable({ providedIn: 'root' })
export class MatchSuchauftragService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/match-suchauftrag`;

  matchSuchauftrag(request: MatchSuchauftragRequest): Observable<MatchSuchauftragResponse> {
    const params = new HttpParams().set('kandidatId', request.kandidatId);
    return this.http.get<MatchSuchauftragResponse>(this.baseUrl, { params });
  }
}
