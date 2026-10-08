import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../services/firma.service';
import { Firma } from '../../models/firma.model';

@Component({
  selector: 'app-neue-firma-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>{{ draftFirma.id ? 'Firma bearbeiten' : 'Neue Firma' }}</h2>
        <label>Name
          <input [(ngModel)]="draftFirma.name" placeholder="Firmenname" />
        </label>
        <label>Standort
          <input [(ngModel)]="draftFirma.standort" placeholder="Standort" />
        </label>
        <label>Postleitzahl
          <input [(ngModel)]="draftFirma.postleitzahl" placeholder="PLZ" />
        </label>
        <label>Adresse
          <input [(ngModel)]="draftFirma.adresse" placeholder="Straße und Nummer" />
        </label>
        <label>E-Mail
          <div class="input-with-btn">
            <input type="email" [(ngModel)]="draftFirma.email" placeholder="info@beispiel.de" />
            <button class="btn-link" (click)="copyToClipboard(draftFirma.email)" [disabled]="!draftFirma.email">📋</button>
          </div>
          <span class="field-error" *ngIf="firmaErrors['email']">{{ firmaErrors['email'] }}</span>
        </label>
        <label>Telefon
          <div class="input-with-btn">
            <input [(ngModel)]="draftFirma.telefon" placeholder="+49 30 1234567" />
            <button class="btn-link" (click)="copyToClipboard(draftFirma.telefon)" [disabled]="!draftFirma.telefon">📋</button>
          </div>
          <span class="field-error" *ngIf="firmaErrors['telefon']">{{ firmaErrors['telefon'] }}</span>
        </label>
        <label>Mobil
          <div class="input-with-btn">
            <input [(ngModel)]="draftFirma.mobil" placeholder="+49 170 1234567" />
            <button class="btn-link" (click)="copyToClipboard(draftFirma.mobil)" [disabled]="!draftFirma.mobil">📋</button>
          </div>
          <span class="field-error" *ngIf="firmaErrors['mobil']">{{ firmaErrors['mobil'] }}</span>
        </label>
        <label>Website
          <div class="input-with-btn">
            <input [(ngModel)]="draftFirma.angebotWebsite" placeholder="https://..." />
            <button class="btn-link" (click)="openLink(draftFirma.angebotWebsite)" [disabled]="!draftFirma.angebotWebsite">↗</button>
          </div>
        </label>
        <div class="modal-actions">
          <button class="btn-save" (click)="saveFirma()">Speichern</button>
          <button class="btn-cancel" (click)="close.emit()">Abbrechen</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 420px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .modal input { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .modal input:focus { outline: none; border-color: #3b5bdb; }
    .modal-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .input-with-btn { display: flex; gap: 6px; }
    .input-with-btn input { flex: 1; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
  `]
})
export class NeueFirmaDialogComponent implements OnInit {
  private firmaService = inject(FirmaService);

  /** Initial values; a firma with an id is edited, otherwise a new one is created. */
  @Input() firma: Partial<Firma> = {};
  @Output() saved = new EventEmitter<Firma>();
  @Output() close = new EventEmitter<void>();

  draftFirma: Partial<Firma> = {};
  firmaErrors: Record<string, string> = {};

  ngOnInit(): void {
    this.draftFirma = { ...this.firma };
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  saveFirma(): void {
    const handlers = {
      next: (firma: Firma) => this.saved.emit(firma),
      error: (err: any) => {
        if (err.status === 400) this.firmaErrors = err.error ?? {};
      },
    };
    if (this.draftFirma.id) {
      this.firmaService.update(this.draftFirma.id, this.draftFirma as Firma).subscribe(handlers);
    } else {
      this.firmaService.create(this.draftFirma as Firma).subscribe(handlers);
    }
  }
}
