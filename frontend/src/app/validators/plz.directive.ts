import { Directive, HostListener, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlzService } from '../services/plz.service';

/**
 * Checks a Postleitzahl input against the known German PLZ while typing.
 * Usage: <input [(ngModel)]="x.postleitzahl" appPlz #plzCheck="appPlz" />
 *        <span class="field-error" *ngIf="plzCheck.fehler">{{ plzCheck.fehler }}</span>
 * Empty is valid. The backend validates again on save (@GueltigePostleitzahl).
 */
@Directive({
  selector: '[appPlz][ngModel]',
  standalone: true,
  exportAs: 'appPlz',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: PlzDirective, multi: true }],
})
export class PlzDirective implements AsyncValidator {
  private plzService = inject(PlzService);

  private message: string | null = null;
  private complete = false;
  private blurred = false;

  @HostListener('blur')
  onBlur(): void {
    this.blurred = true;
  }

  /** Message to show: an unknown PLZ right away, a too short/long one only after leaving the field. */
  get fehler(): string | null {
    return this.message && (this.complete || this.blurred) ? this.message : null;
  }

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const plz = PlzDirective.normalize(control.value);
    this.complete = false;
    if (plz === null) return this.result(null);
    if (!/^\d{5}$/.test(plz)) return this.result('Postleitzahl muss aus 5 Ziffern bestehen.');
    this.complete = true;
    return this.plzService.isGueltig(plz).pipe(
      map(gueltig => {
        this.message = gueltig ? null : 'Unbekannte Postleitzahl.';
        return gueltig ? null : { plz: this.message };
      }),
    );
  }

  private result(message: string | null): Observable<ValidationErrors | null> {
    this.message = message;
    return of(message ? { plz: message } : null);
  }

  /** Number inputs (Kandidat) lose the leading zero: 1067 → 01067. */
  private static normalize(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
      const s = String(value);
      return s.length === 4 ? '0' + s : s;
    }
    const s = String(value).trim();
    return s === '' ? null : s;
  }
}
