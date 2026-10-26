import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlzService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/plz`;
  /** PLZ do not change while the app runs, so every PLZ is asked only once. */
  private readonly cache = new Map<string, Observable<boolean>>();

  /** True if the 5-digit PLZ exists. A failed request counts as valid; the backend checks again on save. */
  isGueltig(plz: string): Observable<boolean> {
    let result = this.cache.get(plz);
    if (!result) {
      result = this.http.get<{ gueltig: boolean }>(`${this.baseUrl}/${plz}`).pipe(
        map(res => res.gueltig),
        catchError(() => of(true)),
        shareReplay(1),
      );
      this.cache.set(plz, result);
    }
    return result;
  }
}
