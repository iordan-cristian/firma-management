import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirmaService } from '../../services/firma.service';
import { VerknuepfungService } from '../../services/verknuepfung.service';
import { Kandidat } from '../../models/kandidat.model';
import { Firma } from '../../models/firma.model';
import { Suchauftrag } from '../../models/suchauftrag.model';
import { Verknuepfung } from '../../models/verknuepfung.model';
import { FirmaAutocompleteComponent } from '../firmen/firma-autocomplete.component';
import { NeueFirmaDialogComponent } from '../firmen/neue-firma-dialog.component';

export interface FirmaAusgewaehltEvent {
  /** The stored link between Kandidat, Firma and optional Suchauftrag. */
  verknuepfung: Verknuepfung;
  firma: Firma;
}

/** Neue Verknüpfung: selects a Firma (and optionally one of its Suchaufträge) for a Kandidat and stores the link. */
@Component({
  selector: 'app-neue-verknuepfung-firma-auswaehlen',
  standalone: true,
  imports: [CommonModule, FirmaAutocompleteComponent, NeueFirmaDialogComponent],
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Neue Verknüpfung für {{ kandidatName }} – Firma auswählen</h2>

        <label class="field-label">Firma</label>
        <app-firma-autocomplete
          (firmaSelected)="onFirmaSelected($event)"
          (createFirma)="openNeueFirma($event)"
        ></app-firma-autocomplete>

        <ng-container *ngIf="selectedFirma">
          <div class="section-title">Suchaufträge (optional)</div>
          <p class="hint" *ngIf="loadingSuchauftraege">Lade Suchaufträge...</p>
          <div class="suchauftraege" *ngIf="!loadingSuchauftraege">
            <div
              class="suchauftrag-card"
              *ngFor="let s of suchauftraege"
              [class.selected]="s.id === selectedSuchauftragId"
              (click)="toggleSuchauftrag(s)"
            >
              <div class="card-title">
                {{ s.sucheNach || s.aktivitaet }}
                <span class="badge" [class.done]="s.status === 'Fertig'">{{ s.status }}</span>
              </div>
              <div class="card-row" *ngIf="s.postleitzahl || s.ort">{{ s.postleitzahl }} {{ s.ort }}</div>
              <div class="card-row" *ngIf="s.fachlicherSkill">{{ s.fachlicherSkill }}</div>
            </div>
            <p class="hint" *ngIf="!suchauftraege.length">Keine Suchaufträge für diese Firma.</p>
          </div>
        </ng-container>

        <p class="error" *ngIf="error">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-save" [disabled]="!selectedFirma || saving" (click)="auswaehlen()">Auswählen</button>
          <button type="button" class="btn-cancel" (click)="close.emit()">Abbrechen</button>
        </div>
      </div>
    </div>

    <app-neue-firma-dialog
      *ngIf="neueFirmaDraft"
      [firma]="neueFirmaDraft"
      (saved)="onNeueFirmaSaved($event)"
      (close)="neueFirmaDraft = null"
    ></app-neue-firma-dialog>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 560px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .field-label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; }
    .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .hint { font-size: 13px; color: #777; margin: 0; }
    .suchauftraege { display: flex; flex-direction: column; gap: 8px; }
    .suchauftrag-card { background: #f8f9ff; border: 1px solid #e5e9f3; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
    .suchauftrag-card:hover { border-color: #3b5bdb; }
    .suchauftrag-card.selected { border-color: #3b5bdb; background: #eef2fb; box-shadow: inset 0 0 0 1px #3b5bdb; }
    .card-title { font-weight: 600; font-size: 13px; color: #1f2a44; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .card-row { font-size: 12px; color: #555; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 11px; font-weight: 400; }
    .badge.done { background: #b6e3b6; }
    .error { color: #e03131; font-size: 12px; margin: 12px 0 0; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover:not(:disabled) { background: #2f4ac7; }
    .btn-save:disabled { background: #a9b4d6; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
  `]
})
export class NeueVerknuepfungFirmaAuswaehlenComponent {
  private firmaService = inject(FirmaService);
  private verknuepfungService = inject(VerknuepfungService);

  @Input() kandidat?: Kandidat;
  /** Display name shown in the title. */
  @Input() kandidatName = '';
  @Output() firmaAusgewaehlt = new EventEmitter<FirmaAusgewaehltEvent>();
  @Output() close = new EventEmitter<void>();

  selectedFirma: Firma | null = null;
  suchauftraege: Suchauftrag[] = [];
  selectedSuchauftragId: string | null = null;
  loadingSuchauftraege = false;
  neueFirmaDraft: Partial<Firma> | null = null;
  saving = false;
  error: string | null = null;

  onFirmaSelected(firma: Firma | null): void {
    this.selectedFirma = firma;
    this.suchauftraege = [];
    this.selectedSuchauftragId = null;
    this.error = null;
    if (!firma?.id) return;
    this.loadingSuchauftraege = true;
    this.firmaService.getSuchauftragForFirma(firma.id).subscribe({
      next: list => {
        // Ignore late responses for a Firma that is no longer selected
        if (this.selectedFirma?.id !== firma.id) return;
        this.suchauftraege = list;
        this.loadingSuchauftraege = false;
      },
      error: () => { this.loadingSuchauftraege = false; },
    });
  }

  toggleSuchauftrag(s: Suchauftrag): void {
    this.selectedSuchauftragId = this.selectedSuchauftragId === s.id ? null : s.id ?? null;
  }

  openNeueFirma(name: string): void {
    this.neueFirmaDraft = { name };
  }

  onNeueFirmaSaved(firma: Firma): void {
    this.neueFirmaDraft = null;
    this.saveVerknuepfung(firma, null);
  }

  auswaehlen(): void {
    if (this.selectedFirma) this.saveVerknuepfung(this.selectedFirma, this.selectedSuchauftragId);
  }

  private saveVerknuepfung(firma: Firma, suchauftragId: string | null): void {
    if (!this.kandidat?.id || !firma.id) return;
    this.saving = true;
    this.error = null;
    this.verknuepfungService.create({
      kandidatId: this.kandidat.id,
      firmaId: firma.id,
      suchauftragId: suchauftragId ?? undefined,
    }).subscribe({
      next: verknuepfung => {
        this.saving = false;
        this.firmaAusgewaehlt.emit({ verknuepfung, firma });
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.error ?? 'Verknüpfung konnte nicht gespeichert werden.';
      },
    });
  }
}
