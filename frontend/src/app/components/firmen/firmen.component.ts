import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../services/firma.service';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { SuchauftragService } from '../../services/suchauftrag.service';
import { VertragService } from '../../services/vertrag.service';
import { Firma } from '../../models/firma.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { Suchauftrag, AKTIVITAET_OPTIONS, STATUS_OPTIONS } from '../../models/suchauftrag.model';
import { Vertrag } from '../../models/vertrag.model';

type DetailMode = 'ansprechpartner' | 'suchauftraege' | 'vertraege';

@Component({
  selector: 'app-firmen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Firmen</h1>
        <button class="btn-add" (click)="openAddModal()">+ Firma</button>
      </div>
      <p class="hint">Right-click a row to view related data.</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Standort</th>
              <th>Allgemeiner Schwerpunkt</th>
              <th>Kontaktdaten</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let f of firmen">
              <tr (contextmenu)="openMenu($event, f)"
                  [class.selected]="expandedFirma?.id === f.id">
                <td>{{ f.standort }}</td>
                <td>{{ f.allgemeinerSchwerpunkt }}</td>
                <td>{{ f.kontaktdaten }}</td>
              </tr>
              <tr *ngIf="expandedFirma?.id === f.id && detailMode" class="detail-row">
                <td colspan="3">
                  <div class="inline-detail">
                    <div class="inline-detail-header">
                      <strong>{{ detailTitle }}</strong>
                      <div class="header-actions">
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'ansprechpartner'" (click)="openAddAnsprechpartner()">+ Ansprechpartner</button>
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'suchauftraege'" (click)="openAddSuchauftrag()">+ Suchauftrag</button>
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'vertraege'" (click)="openAddVertrag()">+ Vertrag</button>
                        <button class="close" (click)="closeDetail()">✕</button>
                      </div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'ansprechpartner'">
                      <div class="card" *ngFor="let a of ansprechpartnerList">
                        <div class="card-title">{{ a.vorname }} {{ a.nachname }}</div>
                        <div class="card-row"><span>Position:</span> {{ a.position }}</div>
                        <div class="card-row"><span>Schwerpunkt:</span> {{ a.schwerpunkt }}</div>
                        <div class="card-row"><span>E-Mail:</span> {{ a.email }}</div>
                        <div class="card-row"><span>Telefon:</span> {{ a.telefonnummer }}</div>
                        <div class="card-row"><span>Kontaktinterval:</span> {{ a.kontaktinterval }}</div>
                        <div class="card-info" *ngIf="a.informationen">{{ a.informationen }}</div>
                      </div>
                      <div *ngIf="!ansprechpartnerList.length" class="empty">No Ansprechpartner.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'suchauftraege'">
                      <div class="card" *ngFor="let s of suchauftragList">
                        <div class="card-title">{{ s.aktivitaet }}</div>
                        <div class="card-row"><span>Status:</span>
                          <span class="badge" [class.done]="s.status === 'Fertig'">{{ s.status }}</span>
                        </div>
                        <div class="card-row"><span>Auftrag:</span> {{ s.auftragPlaceholder }}</div>
                      </div>
                      <div *ngIf="!suchauftragList.length" class="empty">No Suchaufträge.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'vertraege'">
                      <div class="card" *ngFor="let v of vertragList">
                        <div class="card-title">Vertrag</div>
                        <div class="card-row"><span>Wert:</span> {{ v.wert | number:'1.2-2' }} €</div>
                        <div class="card-row"><span>Bezahlbar am:</span> {{ v.bezahlbarAm }}</div>
                        <div class="card-row"><span>Bezahlt:</span>
                          <span class="badge" [class.done]="v.bezahlt">{{ v.bezahlt ? 'Ja' : 'Nein' }}</span>
                        </div>
                      </div>
                      <div *ngIf="!vertragList.length" class="empty">No Verträge.</div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="!firmen.length"><td colspan="3" class="empty">No Firmen yet.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Custom right-click context menu -->
      <div class="ctx-menu"
           *ngIf="menuOpen"
           [style.top.px]="menuY"
           [style.left.px]="menuX"
           (click)="$event.stopPropagation()">
        <button (click)="loadDetail('ansprechpartner')">Ansprechpartner</button>
        <button (click)="loadDetail('suchauftraege')">Suchaufträge</button>
        <button (click)="loadDetail('vertraege')">Verträge</button>
      </div>

      <!-- Add Firma Modal -->
      <div class="modal-backdrop" *ngIf="addFirmaOpen" (click)="closeAddModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Neue Firma</h2>
          <label>Standort
            <input [(ngModel)]="draftFirma.standort" placeholder="Standort" />
          </label>
          <label>Allgemeiner Schwerpunkt
            <input [(ngModel)]="draftFirma.allgemeinerSchwerpunkt" placeholder="Schwerpunkt" />
          </label>
          <label>Kontaktdaten
            <input [(ngModel)]="draftFirma.kontaktdaten" placeholder="Kontaktdaten" />
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveFirma()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add Ansprechpartner Modal -->
      <div class="modal-backdrop" *ngIf="addAnsprechpartnerOpen" (click)="addAnsprechpartnerOpen = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Neuer Ansprechpartner</h2>
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
          <label>E-Mail
            <input [(ngModel)]="draftAnsprechpartner.email" placeholder="E-Mail" />
          </label>
          <label>Telefon
            <input [(ngModel)]="draftAnsprechpartner.telefonnummer" placeholder="Telefonnummer" />
          </label>
          <label>Kontaktinterval
            <input [(ngModel)]="draftAnsprechpartner.kontaktinterval" placeholder="z.B. wöchentlich" />
          </label>
          <label>Informationen
            <textarea [(ngModel)]="draftAnsprechpartner.informationen" placeholder="Notizen..." rows="3"></textarea>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveAnsprechpartner()">Speichern</button>
            <button class="btn-cancel" (click)="addAnsprechpartnerOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add Suchauftrag Modal -->
      <div class="modal-backdrop" *ngIf="addSuchauftragOpen" (click)="addSuchauftragOpen = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Neuer Suchauftrag</h2>
          <label>Ansprechpartner ID *
            <input [(ngModel)]="draftSuchauftrag.ansprechpartnerId" placeholder="UUID" />
          </label>
          <label>Aktivität *
            <select [(ngModel)]="draftSuchauftrag.aktivitaet">
              <option *ngFor="let k of aktivitaetOptions" [value]="k">{{ k }}</option>
            </select>
          </label>
          <label>Auftrag
            <input [(ngModel)]="draftSuchauftrag.auftragPlaceholder" placeholder="Beschreibung" />
          </label>
          <label>Status *
            <select [(ngModel)]="draftSuchauftrag.status">
              <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
            </select>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveSuchauftrag()">Speichern</button>
            <button class="btn-cancel" (click)="addSuchauftragOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add Vertrag Modal -->
      <div class="modal-backdrop" *ngIf="addVertragOpen" (click)="addVertragOpen = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Neuer Vertrag</h2>
          <label>Ansprechpartner ID *
            <input [(ngModel)]="draftVertrag.ansprechpartnerId" placeholder="UUID" />
          </label>
          <label>Suchauftrag ID
            <input [(ngModel)]="draftVertrag.suchauftragId" placeholder="UUID (optional)" />
          </label>
          <label>Wert (€)
            <input type="number" [(ngModel)]="draftVertrag.wert" placeholder="0.00" step="0.01" />
          </label>
          <label>Bezahlbar am
            <input type="date" [(ngModel)]="bezahlbarAmInput" />
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="draftVertrag.bezahlt" />
            <span>Bezahlt</span>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveVertrag()">Speichern</button>
            <button class="btn-cancel" (click)="addVertragOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { '(document:click)': 'closeMenu()' },
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .page-header h1 { margin: 0; color: #1f2a44; }
    .hint { color: #777; margin: 0 0 16px; font-size: 13px; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .btn-add:hover { background: #2f4ac7; }

    .table-wrap { background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 14px; text-align: left; font-size: 14px; }
    th { background: #f1f3f8; color: #1f2a44; font-weight: 600; border-bottom: 1px solid #dfe3ee; }
    tbody tr { border-top: 1px solid #f0f1f5; cursor: context-menu; }
    tbody tr:hover { background: #fafbff; }
    tbody tr.selected { background: #eef2fb; }
    tbody tr.detail-row { cursor: default; background: #f4f7ff; border-top: none; }
    tbody tr.detail-row:hover { background: #f4f7ff; }
    .empty { color: #999; text-align: center; padding: 18px; }

    .inline-detail { padding: 16px; }
    .inline-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .inline-detail-header strong { font-size: 15px; color: #1f2a44; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .btn-add-small { background: #3b5bdb; color: white; border: none; padding: 5px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-add-small:hover { background: #2f4ac7; }

    .ctx-menu {
      position: fixed; background: white; border: 1px solid #dfe3ee; border-radius: 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      min-width: 180px; z-index: 1000; overflow: hidden;
    }
    .ctx-menu button { background: white; border: none; text-align: left; padding: 10px 14px; font-size: 14px; cursor: pointer; }
    .ctx-menu button:hover { background: #eef2fb; }

    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; max-height: 300px; overflow-y: auto; }
    .card { background: white; border: 1px solid #e5e9f3; border-radius: 8px; padding: 14px; }
    .card-title { font-weight: 600; margin-bottom: 8px; color: #1f2a44; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .card-info { margin-top: 8px; font-size: 12px; color: #555; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 12px; }
    .badge.done { background: #b6e3b6; }
    .close { background: transparent; border: 1px solid #dfe3ee; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }

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
    .modal label.checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
    .modal input:not([type="checkbox"]), .modal select, .modal textarea {
      padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    .modal input:not([type="checkbox"]):focus, .modal select:focus, .modal textarea:focus {
      outline: none; border-color: #3b5bdb;
    }
    .modal textarea { resize: vertical; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
  `]
})
export class FirmenComponent implements OnInit {
  private firmaService = inject(FirmaService);
  private ansprechpartnerService = inject(AnsprechpartnerService);
  private suchauftragService = inject(SuchauftragService);
  private vertragService = inject(VertragService);

  firmen: Firma[] = [];
  selectedFirma: Firma | null = null;
  expandedFirma: Firma | null = null;

  menuOpen = false;
  menuX = 0;
  menuY = 0;

  detailMode: DetailMode | null = null;
  detailTitle = '';
  ansprechpartnerList: Ansprechpartner[] = [];
  suchauftragList: Suchauftrag[] = [];
  vertragList: Vertrag[] = [];

  readonly aktivitaetOptions = AKTIVITAET_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  // Add Firma
  addFirmaOpen = false;
  draftFirma: Partial<Firma> = {};

  // Add Ansprechpartner
  addAnsprechpartnerOpen = false;
  draftAnsprechpartner: Partial<Ansprechpartner> = {};

  // Add Suchauftrag
  addSuchauftragOpen = false;
  draftSuchauftrag: Partial<Suchauftrag> = {};

  // Add Vertrag
  addVertragOpen = false;
  draftVertrag: Partial<Vertrag> = {};
  bezahlbarAmInput = '';

  ngOnInit(): void {
    this.firmaService.getAll().subscribe(list => (this.firmen = list));
  }

  // ── Firma ────────────────────────────────────────────────
  openAddModal(): void { this.draftFirma = {}; this.addFirmaOpen = true; }
  closeAddModal(): void { this.addFirmaOpen = false; }

  saveFirma(): void {
    this.firmaService.create(this.draftFirma as Firma).subscribe(created => {
      this.firmen = [...this.firmen, created];
      this.closeAddModal();
    });
  }

  // ── Ansprechpartner ──────────────────────────────────────
  openAddAnsprechpartner(): void {
    this.draftAnsprechpartner = { firmaId: this.expandedFirma!.id };
    this.addAnsprechpartnerOpen = true;
  }

  saveAnsprechpartner(): void {
    this.ansprechpartnerService.create(this.draftAnsprechpartner as Ansprechpartner).subscribe(() => {
      this.firmaService.getAnsprechpartnerForFirma(this.expandedFirma!.id!).subscribe(list => (this.ansprechpartnerList = list));
      this.addAnsprechpartnerOpen = false;
    });
  }

  // ── Suchauftrag ──────────────────────────────────────────
  openAddSuchauftrag(): void {
    this.draftSuchauftrag = { aktivitaet: 'Investoren', status: 'in Arbeit' };
    this.addSuchauftragOpen = true;
  }

  saveSuchauftrag(): void {
    if (!this.draftSuchauftrag.ansprechpartnerId) return;
    this.suchauftragService.create(this.draftSuchauftrag as Suchauftrag).subscribe(() => {
      this.firmaService.getSuchauftragForFirma(this.expandedFirma!.id!).subscribe(list => (this.suchauftragList = list));
      this.addSuchauftragOpen = false;
    });
  }

  // ── Vertrag ──────────────────────────────────────────────
  openAddVertrag(): void {
    this.draftVertrag = { firmaId: this.expandedFirma!.id, bezahlt: false };
    this.bezahlbarAmInput = '';
    this.addVertragOpen = true;
  }

  saveVertrag(): void {
    if (!this.draftVertrag.ansprechpartnerId) return;
    if (this.bezahlbarAmInput) {
      const [y, m, d] = this.bezahlbarAmInput.split('-');
      this.draftVertrag.bezahlbarAm = `${d}/${m}/${y}`;
    }
    this.vertragService.create(this.draftVertrag as Vertrag).subscribe(() => {
      this.firmaService.getVertragForFirma(this.expandedFirma!.id!).subscribe(list => (this.vertragList = list));
      this.addVertragOpen = false;
    });
  }

  // ── Context menu & detail ────────────────────────────────
  openMenu(event: MouseEvent, firma: Firma): void {
    event.preventDefault();
    this.selectedFirma = firma;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuOpen = true;
  }

  closeMenu(): void { this.menuOpen = false; }

  loadDetail(mode: DetailMode): void {
    this.menuOpen = false;
    if (!this.selectedFirma?.id) return;
    this.expandedFirma = this.selectedFirma;
    const id = this.expandedFirma.id!;

    this.ansprechpartnerList = [];
    this.suchauftragList = [];
    this.vertragList = [];

    this.detailMode = mode;
    if (mode === 'ansprechpartner') {
      this.detailTitle = `Ansprechpartner — ${this.expandedFirma.standort ?? ''}`;
      this.firmaService.getAnsprechpartnerForFirma(id).subscribe(list => (this.ansprechpartnerList = list));
    } else if (mode === 'suchauftraege') {
      this.detailTitle = `Suchaufträge — ${this.expandedFirma.standort ?? ''}`;
      this.firmaService.getSuchauftragForFirma(id).subscribe(list => (this.suchauftragList = list));
    } else if (mode === 'vertraege') {
      this.detailTitle = `Verträge — ${this.expandedFirma.standort ?? ''}`;
      this.firmaService.getVertragForFirma(id).subscribe(list => (this.vertragList = list));
    }
  }

  closeDetail(): void {
    this.expandedFirma = null;
    this.detailMode = null;
    this.ansprechpartnerList = [];
    this.suchauftragList = [];
    this.vertragList = [];
  }
}