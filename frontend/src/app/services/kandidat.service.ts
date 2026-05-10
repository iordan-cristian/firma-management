import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kandidat } from '../models/kandidat.model';

@Injectable({ providedIn: 'root' })
export class KandidatService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/kandidat';

  getAll(): Observable<Kandidat[]> { return this.http.get<Kandidat[]>(this.baseUrl); }
  getById(id: string): Observable<Kandidat> { return this.http.get<Kandidat>(`${this.baseUrl}/${id}`); }
  create(k: Kandidat): Observable<Kandidat> { return this.http.post<Kandidat>(this.baseUrl, k); }
  update(id: string, k: Kandidat): Observable<Kandidat> { return this.http.put<Kandidat>(`${this.baseUrl}/${id}`, k); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}