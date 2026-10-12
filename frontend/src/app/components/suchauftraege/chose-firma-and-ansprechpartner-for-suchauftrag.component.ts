import { Component, EventEmitter, HostListener, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirmaService } from '../../services/firma.service';
import { Firma } from '../../models/firma.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { Suchauftrag } from '../../models/suchauftrag.model';
import { FirmaAutocompleteComponent } from '../firmen/firma-autocomplete.component';
import { NeueFirmaDialogComponent } from '../firmen/neue-firma-dialog.component';
import { AnsprechpartnerDialogComponent } from '../Ansprechpartner/ansprechpartner-dialog.component';
import { SuchauftragDialogComponent } from './suchauftrag-dialog.component';

/** Suchauftrag anlegen: selects (or creates) a Firma and one of its Ansprechpartner, then opens the Suchauftrag dialog. */
@Component({
  selector: 'app-chose-firma-and-ansprechpartner-for-suchauftrag',
  standalone: true,
  imports: [CommonModule, FirmaAutocompleteComponent, NeueFirmaDialogComponent, AnsprechpartnerDialogComponent, SuchauftragDialogComponent],
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Suchauftrag anlegen</h2>

        <label class="field-label">Firma</label>
        <app-firma-autocomplete
          #firmaAc
          (firmaSelected)="onFirmaSelected($event)"
          (createFirma)="openNeueFirma($event)"
        ></app-firma-autocomplete>

        <ng-container *ngIf="selectedFirma">
          <div class="section-title">Ansprechpartner</div>
          <p class="hint" *ngIf="loadingAnsprechpartner">Lade Ansprechpartner...</p>
          <div class="cards" *ngIf="!loadingAnsprechpartner">
            <div
              class="card"
              *ngFor="let a of ansprechpartnerList"
              [class.selected]="a.id === selectedAnsprechpartnerId"
              (click)="selectedAnsprechpartnerId = a.id ?? null"
            >
              <div class="card-title">{{ ansprechpartnerName(a) }}</div>
              <div class="card-row" *ngIf="a.position">{{ a.position }}</div>
              <div class="card-row" *ngIf="a.email">{{ a.email }}</div>
              <div class="card-row" *ngIf="a.telefonnummer">{{ a.telefonnummer }}</div>
            </div>
            <div class="card card-new" (click)="openNeuerAnsprechpartner()">+ Neuer Ansprechpartner</div>
          </div>
        </ng-container>

        <div class="modal-actions">
          <button type="button" class="btn-save" [disabled]="!selectedFirma || !selectedAnsprechpartnerId" (click)="suchauftragDialogOpen = true">Suchauftrag anlegen</button>
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

    <app-ansprechpartner-dialog
      *ngIf="neuerAnsprechpartnerDraft"
      [ansprechpartner]="neuerAnsprechpartnerDraft"
      (saved)="onAnsprechpartnerSaved($event)"
      (close)="neuerAnsprechpartnerDraft = null"
    ></app-ansprechpartner-dialog>

    <app-suchauftrag-dialog
      *ngIf="suchauftragDialogOpen && selectedFirma"
      [firma]="selectedFirma"
      [ansprechpartnerId]="selectedAnsprechpartnerId ?? undefined"
      (saved)="onSuchauftragSaved($event)"
      (close)="onSuchauftragDialogClosed()"
    ></app-suchauftrag-dialog>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 720px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .field-label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; }
    .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .hint { font-size: 13px; color: #777; margin: 0; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
    .card { background: #f8f9ff; border: 1px solid #e5e9f3; border-radius: 8px; padding: 10px 12px; cursor: pointer; word-break: break-word; }
    .card:hover { border-color: #3b5bdb; }
    .card.selected { border-color: #3b5bdb; background: #eef2fb; box-shadow: inset 0 0 0 1px #3b5bdb; }
    .card-new { display: flex; align-items: center; justify-content: center; min-height: 60px; border-style: dashed; background: white; color: #3b5bdb; font-size: 13px; font-weight: 600; }
    .card-title { font-weight: 600; font-size: 13px; color: #1f2a44; }
    .card-row { font-size: 12px; color: #555; margin-top: 4px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover:not(:disabled) { background: #2f4ac7; }
    .btn-save:disabled { background: #a9b4d6; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
  `]
})
export class ChoseFirmaAndAnsprechpartnerForSuchauftragComponent {
  private firmaService = inject(FirmaService);

  /** Emits the stored Suchauftrag. */
  @Output() saved = new EventEmitter<Suchauftrag>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('firmaAc') firmaAutocomplete?: FirmaAutocompleteComponent;

  selectedFirma: Firma | null = null;
  ansprechpartnerList: Ansprechpartner[] = [];
  selectedAnsprechpartnerId: string | null = null;
  loadingAnsprechpartner = false;
  neueFirmaDraft: Partial<Firma> | null = null;
  neuerAnsprechpartnerDraft: Partial<Ansprechpartner> | null = null;
  suchauftragDialogOpen = false;
  /** Set once the Suchauftrag dialog stored the Suchauftrag; the mask closes together with that dialog. */
  private suchauftragSaved = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    // A child dialog handles its own Escape; only close the mask when it is on top
    if (this.neueFirmaDraft || this.neuerAnsprechpartnerDraft || this.suchauftragDialogOpen) return;
    this.close.emit();
  }

  onFirmaSelected(firma: Firma | null): void {
    this.selectedFirma = firma;
    this.ansprechpartnerList = [];
    this.selectedAnsprechpartnerId = null;
    if (firma?.id) this.loadAnsprechpartner(firma.id);
  }

  openNeueFirma(name: string): void {
    this.neueFirmaDraft = { name };
  }

  onNeueFirmaSaved(firma: Firma): void {
    this.neueFirmaDraft = null;
    // Shows the new Firma in the search field and triggers onFirmaSelected
    this.firmaAutocomplete?.select(firma);
  }

  openNeuerAnsprechpartner(): void {
    if (this.selectedFirma?.id) this.neuerAnsprechpartnerDraft = { firmaId: this.selectedFirma.id };
  }

  onAnsprechpartnerSaved(ansprechpartner: Ansprechpartner): void {
    this.neuerAnsprechpartnerDraft = null;
    if (this.selectedFirma?.id) this.loadAnsprechpartner(this.selectedFirma.id, ansprechpartner.id);
  }

  onSuchauftragSaved(suchauftrag: Suchauftrag): void {
    this.suchauftragSaved = true;
    this.saved.emit(suchauftrag);
  }

  onSuchauftragDialogClosed(): void {
    this.suchauftragDialogOpen = false;
    if (this.suchauftragSaved) this.close.emit();
  }

  ansprechpartnerName(a: Ansprechpartner): string {
    const anrede = a.geschlecht === 'männlich' ? 'Herr' : a.geschlecht === 'weiblich' ? 'Frau' : '';
    return [anrede, a.titel, a.vorname, a.nachname].filter(Boolean).join(' ') || '-';
  }

  private loadAnsprechpartner(firmaId: string, selectId?: string): void {
    this.loadingAnsprechpartner = true;
    this.firmaService.getAnsprechpartnerForFirma(firmaId).subscribe({
      next: list => {
        // Ignore late responses for a Firma that is no longer selected
        if (this.selectedFirma?.id !== firmaId) return;
        this.ansprechpartnerList = list;
        if (selectId) this.selectedAnsprechpartnerId = selectId;
        this.loadingAnsprechpartner = false;
      },
      error: () => { this.loadingAnsprechpartner = false; },
    });
  }
}
