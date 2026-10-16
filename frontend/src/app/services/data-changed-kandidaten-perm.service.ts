import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

/** Lets the Kandidaten (Perm) tabs tell each other that data was changed, so they can reload. */
@Injectable({ providedIn: 'root' })
export class DataChangedKandidatenPermService {
  private readonly changedSubject = new Subject<object>();

  /** Notifies all listeners except the source itself (it already reloads on its own). */
  notify(source: object): void {
    this.changedSubject.next(source);
  }

  /** Emits whenever a component other than the given one changed data. */
  changedByOthers(self: object): Observable<object> {
    return this.changedSubject.pipe(filter(source => source !== self));
  }
}
