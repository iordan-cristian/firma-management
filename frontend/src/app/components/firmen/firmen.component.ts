import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../services/firma.service';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { VertragService } from '../../services/vertrag.service';
import { Firma } from '../../models/firma.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { Suchauftrag } from '../../models/suchauftrag.model';
import { Vertrag } from '../../models/vertrag.model';
import { Geschlecht, GESCHLECHT_OPTIONS, TITEL_OPTIONS } from '../../models/kandidat.model';
import { VerknuepfungService } from '../../services/verknuepfung.service';
import { VerknuepfungKandidat } from '../../models/verknuepfung.model';
import { NeueFirmaDialogComponent } from './neue-firma-dialog.component';
import { SuchauftragDialogComponent, SuchauftragVerknuepfungenChangedEvent } from '../suchauftraege/suchauftrag-dialog.component';

type DetailMode = 'ansprechpartner' | 'suchauftraege' | 'vertraege';

@Component({
  selector: 'app-firmen',
  standalone: true,
  imports: [CommonModule, FormsModule, NeueFirmaDialogComponent, SuchauftragDialogComponent],
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
              <th>Name</th>
              <th>Anschrift</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Mobil</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let f of firmen">
              <tr (contextmenu)="openMenu($event, f)"
                  (dblclick)="openEditFirma(f)"
                  [class.selected]="expandedFirma?.id === f.id">
                <td>{{ f.name }}</td>
                <td>{{ anschrift(f) }}</td>
                <td>{{ f.email }}</td>
                <td>{{ f.telefon }}</td>
                <td>{{ f.mobil }}</td>
                <td>
                  <a *ngIf="f.angebotWebsite" [href]="f.angebotWebsite" target="_blank" rel="noopener noreferrer" class="profile-link">↗</a>
                  <span *ngIf="!f.angebotWebsite">–</span>
                </td>
              </tr>
              <tr *ngIf="expandedFirma?.id === f.id && detailMode" class="detail-row">
                <td colspan="6">
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
                      <div class="card" *ngFor="let a of ansprechpartnerList" (dblclick)="openEditAnsprechpartner(a)">
                        <div class="card-title">{{ anrede(a.geschlecht) }} {{ a.titel }} {{ a.vorname }} {{ a.nachname }}</div>
                        <div class="card-row"><span>Position:</span> {{ a.position }}</div>
                        <div class="card-row"><span>Schwerpunkt:</span> {{ a.schwerpunkt }}</div>
                        <div class="card-row"><span>E-Mail:</span> {{ a.email }}</div>
                        <div class="card-row"><span>Telefon:</span> {{ a.telefonnummer }}</div>
                        <div class="card-row"><span>Kontaktinterval:</span> {{ a.kontaktinterval }}</div>
                        <div class="card-row" *ngIf="a.linkedinProfil"><span>LinkedIn:</span> <a [href]="a.linkedinProfil" target="_blank" rel="noopener noreferrer" class="profile-link">{{ a.linkedinProfil }}</a></div>
                        <div class="card-row" *ngIf="a.xingProfil"><span>Xing:</span> <a [href]="a.xingProfil" target="_blank" rel="noopener noreferrer" class="profile-link">{{ a.xingProfil }}</a></div>
                        <div class="card-info" *ngIf="a.informationen">{{ a.informationen }}</div>
                      </div>
                      <div *ngIf="!ansprechpartnerList.length" class="empty">No Ansprechpartner.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'suchauftraege'">
                      <div class="card" *ngFor="let s of suchauftragList" (dblclick)="openEditSuchauftrag(s)">
                        <div class="card-title">{{ s.aktivitaet }}</div>
                        <div class="card-row" *ngIf="s.sucheNach"><span>Suche Nach:</span> {{ s.sucheNach }}</div>
                        <ng-container *ngIf="verknuepfungenFor(s.id).length">
                          <div class="card-divider">Verknüpfungen</div>
                          <div class="card-row" *ngFor="let v of verknuepfungenFor(s.id)">
                            <span>{{ v.vorname }} {{ v.nachname }}</span> <span *ngIf="v.position">— {{ v.position }}</span>
                          </div>
                          <hr class="card-hr" />
                        </ng-container>
                        <div class="card-row"><span>Status:</span>
                          <span class="badge" [class.done]="s.status === 'Fertig'">{{ s.status }}</span>
                        </div>
                        <div class="card-row" *ngIf="s.postleitzahl || s.ort"><span>Ort:</span> {{ s.postleitzahl }} {{ s.ort }}</div>
                        <div class="card-row" *ngIf="s.adresse"><span>Adresse:</span> {{ s.adresse }}</div>
                        <div class="card-row" *ngIf="s.allgemeinerSchwerpunkt"><span>Allgemeiner Schwerpunkt:</span> {{ s.allgemeinerSchwerpunkt }}</div>
                        <div class="card-row" *ngIf="s.fachlicherSkill"><span>Fachlicher Skill:</span> {{ s.fachlicherSkill }}</div>
                        <div class="card-row" *ngIf="gehaltDisplay(s.gehaltMinimum, s.gehaltMaximum) as g"><span>Gehalt:</span> {{ g }}</div>
                        <div class="card-row" *ngIf="s.gehaltMehrInfo"><span>Gehalt Info:</span> {{ s.gehaltMehrInfo }}</div>
                        <div class="card-row" *ngIf="s.berufserfahrung != null"><span>Berufserfahrung:</span> {{ s.berufserfahrung }} Jahre</div>
                        <div class="card-row" *ngIf="s.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ s.branchenkenntnisse }}</div>
                        <div class="card-row" *ngIf="s.zertifikate"><span>Zertifikate:</span> {{ s.zertifikate }}</div>
                        <div class="card-row" *ngIf="s.deutsch"><span>Deutsch:</span> {{ s.deutsch }}</div>
                        <div class="card-row" *ngIf="s.englisch"><span>Englisch:</span> {{ s.englisch }}</div>
                        <div class="card-row" *ngIf="s.sonstigeSprachen"><span>Sonstige Sprachen:</span> {{ s.sonstigeSprachen }}</div>
                        <div class="card-info" *ngIf="s.informationen">{{ s.informationen }}</div>
                        <div class="card-row" *ngIf="s.anlageDatum"><span>Anlage Datum:</span> {{ s.anlageDatum }}</div>
                      </div>
                      <div *ngIf="!suchauftragList.length" class="empty">No Suchaufträge.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'vertraege'">
                      <div class="card" *ngFor="let v of vertragList" (dblclick)="openEditVertrag(v)">
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
            <tr *ngIf="!firmen.length"><td colspan="7" class="empty">No Firmen yet.</td></tr>
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

      <!-- Add / Edit Firma Modal -->
      <app-neue-firma-dialog
        *ngIf="addFirmaOpen"
        [firma]="draftFirma"
        (saved)="onFirmaSaved($event)"
        (close)="closeAddModal()"
      ></app-neue-firma-dialog>

      <!-- Add Ansprechpartner Modal -->
      <div class="modal-backdrop" *ngIf="addAnsprechpartnerOpen">
        <div class="modal modal-wide">
          <h2>{{ editingAnsprechpartnerId ? 'Ansprechpartner bearbeiten' : 'Neuer Ansprechpartner' }}</h2>
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
            <button class="btn-cancel" (click)="addAnsprechpartnerOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Suchauftrag -->
      <app-suchauftrag-dialog
        *ngIf="dialogSuchauftrag && expandedFirma"
        [firma]="expandedFirma"
        [suchauftrag]="dialogSuchauftrag.id ? $any(dialogSuchauftrag) : undefined"
        (saved)="onSuchauftragSaved()"
        (verknuepfungenChanged)="onVerknuepfungenChanged($event)"
        (close)="dialogSuchauftrag = null"
      ></app-suchauftrag-dialog>

      <!-- Add Vertrag Modal -->
      <div class="modal-backdrop" *ngIf="addVertragOpen">
        <div class="modal">
          <h2>{{ editingVertragId ? 'Vertrag bearbeiten' : 'Neuer Vertrag' }}</h2>
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
    .hint { color: #777; margin: 0 0 16px; font-size: 13px; white-space: pre-line; }
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
      min-width: 180px; z-index: 2100; overflow: hidden;
    }
    .ctx-menu button { background: white; border: none; text-align: left; padding: 10px 14px; font-size: 14px; cursor: pointer; }
    .ctx-menu button:hover { background: #eef2fb; }

    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid #e5e9f3; border-radius: 8px; padding: 14px; cursor: pointer; }
    .card:hover { border-color: #3b5bdb; }
    .card-title { font-weight: 600; margin-bottom: 8px; color: #1f2a44; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .card-info { margin-top: 8px; font-size: 12px; color: #555; white-space: pre-wrap; }
    .card-hr { border: none; border-top: 1px solid #e5e9f3; margin: 8px 0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 12px; }
    .badge.done { background: #b6e3b6; }
    .profile-link { color: #3b5bdb; text-decoration: none; font-size: 13px; word-break: break-all; }
    .profile-link:hover { text-decoration: underline; }
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
    .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .modal label.checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
    .modal input:not([type="checkbox"]), .modal select, .modal textarea {
      padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    .modal input:not([type="checkbox"]):focus, .modal select:focus, .modal textarea:focus {
      outline: none; border-color: #3b5bdb;
    }
    .modal textarea { resize: vertical; }
    .modal.modal-wide { width: 640px; }
    .modal-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-save:disabled { background: #a9b4d6; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .input-with-btn { display: flex; gap: 6px; }
    .input-with-btn input { flex: 1; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
  `]
})
export class FirmenComponent implements OnInit {
  private firmaService = inject(FirmaService);
  private ansprechpartnerService = inject(AnsprechpartnerService);
  private vertragService = inject(VertragService);
  private verknuepfungService = inject(VerknuepfungService);

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
  verknuepfungenBySuchauftragId: Record<string, VerknuepfungKandidat[]> = {};

  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;

  // Add / Edit Firma
  addFirmaOpen = false;
  draftFirma: Partial<Firma> = {};

  // Add / Edit Ansprechpartner
  addAnsprechpartnerOpen = false;
  editingAnsprechpartnerId: string | null = null;
  draftAnsprechpartner: Partial<Ansprechpartner> = {};
  ansprechpartnerErrors: Record<string, string> = {};

  // Add / Edit Suchauftrag
  /** Open Suchauftrag dialog: null = closed, {} = new Suchauftrag, otherwise the Suchauftrag being edited. */
  dialogSuchauftrag: Partial<Suchauftrag> | null = null;


  // Add / Edit Vertrag
  addVertragOpen = false;
  editingVertragId: string | null = null;
  draftVertrag: Partial<Vertrag> = {};
  bezahlbarAmInput = '';

  ngOnInit(): void {
    this.firmaService.getAll().subscribe(list => (this.firmen = list));
  }


  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  // ── Firma ────────────────────────────────────────────────
  openAddModal(): void { this.draftFirma = {}; this.addFirmaOpen = true; }
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.addFirmaOpen) this.closeAddModal();
    else if (this.addAnsprechpartnerOpen) this.addAnsprechpartnerOpen = false;
    else if (this.addVertragOpen) this.addVertragOpen = false;
  }

  closeAddModal(): void { this.addFirmaOpen = false; }

  openEditFirma(f: Firma): void {
    this.draftFirma = { ...f };
    this.addFirmaOpen = true;
  }

  onFirmaSaved(saved: Firma): void {
    const exists = this.firmen.some(f => f.id === saved.id);
    this.firmen = exists ? this.firmen.map(f => f.id === saved.id ? saved : f) : [...this.firmen, saved];
    this.closeAddModal();
  }

  // ── Ansprechpartner ──────────────────────────────────────
  openAddAnsprechpartner(): void {
    this.editingAnsprechpartnerId = null;
    this.draftAnsprechpartner = { firmaId: this.expandedFirma!.id };
    this.ansprechpartnerErrors = {};
    this.addAnsprechpartnerOpen = true;
  }

  openEditAnsprechpartner(a: Ansprechpartner): void {
    this.editingAnsprechpartnerId = a.id ?? null;
    this.draftAnsprechpartner = { ...a };
    this.ansprechpartnerErrors = {};
    this.addAnsprechpartnerOpen = true;
  }

  saveAnsprechpartner(): void {
    const refresh = () =>
      this.firmaService.getAnsprechpartnerForFirma(this.expandedFirma!.id!).subscribe(list => (this.ansprechpartnerList = list));
    const onError = (err: any) => {
      if (err.status === 400) this.ansprechpartnerErrors = err.error ?? {};
    };
    if (this.editingAnsprechpartnerId) {
      this.ansprechpartnerService.update(this.editingAnsprechpartnerId, this.draftAnsprechpartner as Ansprechpartner).subscribe({
        next: () => { refresh(); this.addAnsprechpartnerOpen = false; this.editingAnsprechpartnerId = null; },
        error: onError,
      });
    } else {
      this.ansprechpartnerService.create(this.draftAnsprechpartner as Ansprechpartner).subscribe({
        next: () => { refresh(); this.addAnsprechpartnerOpen = false; },
        error: onError,
      });
    }
  }

  // ── Suchauftrag ──────────────────────────────────────────
  openAddSuchauftrag(): void {
    this.dialogSuchauftrag = {};
  }

  openEditSuchauftrag(s: Suchauftrag): void {
    this.dialogSuchauftrag = s;
  }

  onSuchauftragSaved(): void {
    this.firmaService.getSuchauftragForFirma(this.expandedFirma!.id!).subscribe(list => (this.suchauftragList = list));
  }

  onVerknuepfungenChanged({ suchauftragId, verknuepfungen }: SuchauftragVerknuepfungenChangedEvent): void {
    if (this.verknuepfungenBySuchauftragId[suchauftragId]) this.verknuepfungenBySuchauftragId[suchauftragId] = verknuepfungen;
  }

  // ── Vertrag ──────────────────────────────────────────────
  openAddVertrag(): void {
    this.editingVertragId = null;
    this.draftVertrag = { firmaId: this.expandedFirma!.id, bezahlt: false };
    this.bezahlbarAmInput = '';
    this.addVertragOpen = true;
  }

  openEditVertrag(v: Vertrag): void {
    this.editingVertragId = v.id ?? null;
    this.draftVertrag = { ...v };
    if (v.bezahlbarAm) {
      const [d, m, y] = v.bezahlbarAm.split('/');
      this.bezahlbarAmInput = `${y}-${m}-${d}`;
    } else {
      this.bezahlbarAmInput = '';
    }
    this.addVertragOpen = true;
  }

  saveVertrag(): void {
    if (!this.draftVertrag.ansprechpartnerId) return;
    if (this.bezahlbarAmInput) {
      const [y, m, d] = this.bezahlbarAmInput.split('-');
      this.draftVertrag.bezahlbarAm = `${d}/${m}/${y}`;
    }
    const refresh = () =>
      this.firmaService.getVertragForFirma(this.expandedFirma!.id!).subscribe(list => (this.vertragList = list));
    if (this.editingVertragId) {
      this.vertragService.update(this.editingVertragId, this.draftVertrag as Vertrag).subscribe(() => {
        refresh(); this.addVertragOpen = false; this.editingVertragId = null;
      });
    } else {
      this.vertragService.create(this.draftVertrag as Vertrag).subscribe(() => {
        refresh(); this.addVertragOpen = false;
      });
    }
  }

  verknuepfungenFor(suchauftragId?: string): VerknuepfungKandidat[] {
    return suchauftragId ? this.verknuepfungenBySuchauftragId[suchauftragId] ?? [] : [];
  }

  anschrift(f: Firma): string {
    return [f.adresse, f.postleitzahl, f.standort].filter(v => v).join(', ');
  }

  anrede(geschlecht?: Geschlecht): string {
    if (geschlecht === 'männlich') return 'Herr';
    if (geschlecht === 'weiblich') return 'Frau';
    return '';
  }

  gehaltDisplay(min?: number, max?: number): string | null {
    if (min != null && max != null) return `${min}-${max}`;
    if (min != null) return `${min}`;
    if (max != null) return `${max}`;
    return null;
  }

  // ── Context menu & detail ────────────────────────────────
  openMenu(event: MouseEvent, firma: Firma): void {
    event.preventDefault();
    this.selectedFirma = firma;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuOpen = true;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

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
      this.detailTitle = `Ansprechpartner — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
      this.firmaService.getAnsprechpartnerForFirma(id).subscribe(list => (this.ansprechpartnerList = list));
    } else if (mode === 'suchauftraege') {
      this.detailTitle = `Suchaufträge — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
      this.firmaService.getSuchauftragForFirma(id).subscribe(list => {
        this.suchauftragList = list;
        this.verknuepfungenBySuchauftragId = {};
        for (const s of list) {
          if (!s.id) continue;
          this.verknuepfungService.getKandidatenForSuchauftrag(s.id).subscribe(links => (this.verknuepfungenBySuchauftragId[s.id!] = links));
        }
      });
    } else if (mode === 'vertraege') {
      this.detailTitle = `Verträge — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
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
