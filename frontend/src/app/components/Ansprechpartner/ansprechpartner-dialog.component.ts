import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { GESCHLECHT_OPTIONS, TITEL_OPTIONS } from '../../models/kandidat.model';

@Component({
  selector: 'app-ansprechpartner-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>{{ draftAnsprechpartner.id ? 'Ansprechpartner bearbeiten' : 'Neuer Ansprechpartner' }}</h2>
        <div class="section-title">Persönliche Daten</div>
        <label>Geschlecht
          <select [(ngModel)]="draftAnsprechpartner.geschlecht">
            <option [ngValue]="undefined">–</option>
            <option *ngFor="let o of geschlechtOptions" [value]="o">{{ o }}</option>
          </select>
        </label>
        <label>Titel
          <select [(ngModel)]="draftAnsprechpartner.titel">
            <option [ngValue]="undefined">–</option>
            <option *ngFor="let o of titelOptions" [value]="o">{{ o }}</option>
          </select>
        </label>
        <label>Vorname
          <input [(ngModel)]="draftAnsprechpartner.vorname" placeholder="Vorname" />
        </label>
        <label>Nachname
          <input [(ngModel)]="draftAnsprechpartner.nachname" placeholder="Nachname" />
        </label>
        <label>Position
          <input [(ngModel)]="draftAnsprechpartner.position" placeholder="Position" />
        </label>
        <label>Schwerpunkt
          <input [(ngModel)]="draftAnsprechpartner.schwerpunkt" placeholder="Schwerpunkt" />
        </label>
        <div class="section-title">Kontakt</div>
        <label>E-Mail
          <div class="input-with-btn">
            <input [(ngModel)]="draftAnsprechpartner.email" placeholder="E-Mail" />
            <button class="btn-link" (click)="copyToClipboard(draftAnsprechpartner.email)" [disabled]="!draftAnsprechpartner.email">📋</button>
          </div>
          <span class="field-error" *ngIf="ansprechpartnerErrors['email']">{{ ansprechpartnerErrors['email'] }}</span>
        </label>
        <label>Telefon
          <div class="input-with-btn">
            <input [(ngModel)]="draftAnsprechpartner.telefonnummer" placeholder="Telefonnummer" />
            <button class="btn-link" (click)="copyToClipboard(draftAnsprechpartner.telefonnummer)" [disabled]="!draftAnsprechpartner.telefonnummer">📋</button>
          </div>
          <span class="field-error" *ngIf="ansprechpartnerErrors['telefonnummer']">{{ ansprechpartnerErrors['telefonnummer'] }}</span>
        </label>
        <label>Kontaktinterval
          <input [(ngModel)]="draftAnsprechpartner.kontaktinterval" placeholder="z.B. wöchentlich" />
        </label>
        <div class="section-title">Social Media</div>
        <label>LinkedIn Profil
          <div class="input-with-btn">
            <input [(ngModel)]="draftAnsprechpartner.linkedinProfil" placeholder="LinkedIn-URL" />
            <button class="btn-link" (click)="openLink(draftAnsprechpartner.linkedinProfil)" [disabled]="!draftAnsprechpartner.linkedinProfil">↗</button>
          </div>
        </label>
        <label>Xing Profil
          <div class="input-with-btn">
            <input [(ngModel)]="draftAnsprechpartner.xingProfil" placeholder="Xing-URL" />
            <button class="btn-link" (click)="openLink(draftAnsprechpartner.xingProfil)" [disabled]="!draftAnsprechpartner.xingProfil">↗</button>
          </div>
        </label>
        <div class="section-title">Informationen</div>
        <label>Informationen
          <textarea [(ngModel)]="draftAnsprechpartner.informationen" placeholder="Notizen..." rows="8" style="min-height:160px"></textarea>
        </label>
        <div class="modal-actions">
          <button class="btn-save" (click)="saveAnsprechpartner()">Speichern</button>
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
      background: white; border-radius: 10px; padding: 28px; width: 640px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .modal input, .modal select, .modal textarea {
      padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    .modal input:focus, .modal select:focus, .modal textarea:focus { outline: none; border-color: #3b5bdb; }
    .modal textarea { resize: vertical; }
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
export class AnsprechpartnerDialogComponent implements OnInit {
  private ansprechpartnerService = inject(AnsprechpartnerService);

  /** Initial values; an Ansprechpartner with an id is edited, otherwise a new one is created (firmaId required). */
  @Input() ansprechpartner: Partial<Ansprechpartner> = {};
  @Output() saved = new EventEmitter<Ansprechpartner>();
  @Output() close = new EventEmitter<void>();

  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;

  draftAnsprechpartner: Partial<Ansprechpartner> = {};
  ansprechpartnerErrors: Record<string, string> = {};

  ngOnInit(): void {
    this.draftAnsprechpartner = { ...this.ansprechpartner };
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  saveAnsprechpartner(): void {
    const handlers = {
      next: (ansprechpartner: Ansprechpartner) => this.saved.emit(ansprechpartner),
      error: (err: any) => {
        if (err.status === 400) this.ansprechpartnerErrors = err.error ?? {};
      },
    };
    const draft = this.draftAnsprechpartner as Ansprechpartner;
    if (draft.id) {
      this.ansprechpartnerService.update(draft.id, draft).subscribe(handlers);
    } else {
      this.ansprechpartnerService.create(draft).subscribe(handlers);
    }
  }
}
