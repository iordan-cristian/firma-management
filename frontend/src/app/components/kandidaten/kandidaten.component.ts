import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import { KandidatDokumentService } from '../../services/kandidat-dokument.service';
import { XlsxImportService } from '../../services/xlsx-import.service';
import {
  Kandidat,
  KandidatDokument,
  StagedDokument,
  DokumentTyp,
  GESCHLECHT_OPTIONS,
  TITEL_OPTIONS,
  SPRACHNIVEAU_OPTIONS,
  FUEHRERSCHEIN_OPTIONS,
  SCHWERPUNKT_OPTIONS,
  DOKUMENT_TYP_OPTIONS,
} from '../../models/kandidat.model';

@Component({
  selector: 'app-kandidaten',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Kandidaten</h1>
        <div class="header-right">
          <input
            class="search-input"
            type="text"
            placeholder="Suche nach Vorname oder Nachname..."
            [(ngModel)]="searchText"
          />
          <button class="btn-add" (click)="openAddModal()">+ Kandidat</button>
        </div>
      </header>

      <p class="hint">{{ filtered.length }} Kandidat(en) gefunden</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>PLZ / Ort</th>
              <th>Aktuelle Position</th>
              <th>Branchenkenntnisse</th>
              <th>Deutsch</th>
              <th>Englisch</th>
              <th class="doc-col">CV</th>
              <th class="doc-col">DSGVO</th>
              <th class="doc-col">Interview</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let k of filtered" (dblclick)="openEditModal(k)" class="clickable">
              <td>{{ k.titel ?? '–' }}</td>
              <td>{{ k.vorname ?? '–' }}</td>
              <td>{{ k.nachname ?? '–' }}</td>
              <td>{{ k.postleitzahl ?? '' }} {{ k.ort ?? '–' }}</td>
              <td>{{ k.aktuellePosition ?? '–' }}</td>
              <td>{{ k.branchenkenntnisse ?? '–' }}</td>
              <td>{{ k.deutsch ?? '–' }}</td>
              <td>{{ k.englisch ?? '–' }}</td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('CV')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('DSGVO')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('INTERVIEW')" disabled /></td>
            </tr>
            <tr *ngIf="!filtered.length">
              <td colspan="8" class="empty">Keine Kandidaten gefunden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Kandidat Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen">
        <div class="modal">
          <h2>{{ editingId ? 'Kandidat bearbeiten' : 'Neuer Kandidat' }}</h2>
          <div class="modal-body">

            <div class="interview-import-row">
              <button class="btn-interview-import" type="button" (click)="interviewFileInput.click()">
                Interview (.xlsx) importieren
              </button>
              <input #interviewFileInput type="file" style="display:none" accept=".xlsx" (change)="onInterviewImport($event)" />
              <span class="import-status" *ngIf="importStatus">{{ importStatus }}</span>
            </div>

            <div class="section-title">DSGVO</div>
            <label>DSGVO Bestätigungs Datum
              <input [(ngModel)]="draft.dsgvoBestaetigungsDatum" placeholder="TT/MM/JJJJ" />
            </label>

            <div class="section-title">Persönliche Daten</div>
            <div class="form-row">
              <label>Geschlecht
                <select [(ngModel)]="draft.geschlecht">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of geschlechtOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Titel
                <select [(ngModel)]="draft.titel">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of titelOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <div class="form-row">
              <label>Vorname
                <input [(ngModel)]="draft.vorname" placeholder="Vorname" />
              </label>
              <label>Nachname
                <input [(ngModel)]="draft.nachname" placeholder="Nachname" />
              </label>
            </div>
            <div class="form-row">
              <label>Postleitzahl
                <input type="number" [(ngModel)]="draft.postleitzahl" placeholder="PLZ" />
              </label>
              <label>Ort
                <input [(ngModel)]="draft.ort" placeholder="Ort" />
              </label>
            </div>
            <div class="form-row">
              <label>Geburtsjahr
                <input type="number" [(ngModel)]="draft.geburtsjahr" placeholder="JJJJ" min="1900" max="2099" />
              </label>
              <label>Staatsangehörigkeit
                <input [(ngModel)]="draft.staatsangehoerigkeit" placeholder="Staatsangehörigkeit" />
              </label>
            </div>
            <div class="form-row">
              <label>Familienstand              <input [(ngModel)]="draft.familienstand" placeholder="z.B. ledig, verheiratet" />
              </label>
              <label>Kinder
                <input [(ngModel)]="draft.kinder" placeholder="z.B. keine, 2" />
              </label>
            </div>

            <div class="section-title">Berufliche Anforderungen</div>
            <div class="form-row">
              <label>Wochenstunden
                <input [(ngModel)]="draft.wochenstunden" placeholder="z.B. 40 oder 30-40" />
              </label>
              <label>Gehalt
                <div class="input-suffix-wrapper">
                  <input [(ngModel)]="draft.gehalt" (input)="filterGehalt($event)" placeholder="z.B. 60000 oder 55000-70000" />
                  <span class="input-suffix">(Tausend €)</span>
                </div>
              </label>
            </div>
            <div class="form-row">
              <label>Wochenendbereitschaft
                <input [(ngModel)]="draft.wochenendbereitschaft" placeholder="ja / nein / gelegentlich" />
              </label>
              <label>Homeoffice
                <input [(ngModel)]="draft.homeoffice" placeholder="z.B. 2 Tage/Woche" />
              </label>
            </div>
            <div class="form-row">
              <label>Firmenwagenregelung
                <input [(ngModel)]="draft.firmenwagenregelung" placeholder="ja / nein / gewünscht" />
              </label>
              <label>Reisetätigkeiten mit Übernachtung
                <input [(ngModel)]="draft.reisetaetigkeitenMitUebernachtung" placeholder="ja / nein / bis X Tage" />
              </label>
            </div>
            <div class="form-row">
              <label>Tägliche Fahrzeit (Min.)
                <input type="number" [(ngModel)]="draft.taeglicheFahrzeit" placeholder="Minuten" min="0" />
              </label>
            </div>

            <div class="section-title">Sprachkenntnisse</div>
            <div class="form-row">
              <label>Deutsch
                <select [(ngModel)]="draft.deutsch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Englisch
                <select [(ngModel)]="draft.englisch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <label>Sonstige Sprachen
              <input [(ngModel)]="draft.sonstigeSprachen" placeholder="z.B. Französisch B2, Spanisch A2" />
            </label>

            <div class="section-title">Qualifikationen</div>
            <div class="form-row">
              <label>Hochschulabschluss
                <input [(ngModel)]="draft.hochschulabschluss" placeholder="z.B. M.Sc. Informatik" />
              </label>
              <label>Berufsausbildung
                <input [(ngModel)]="draft.berufsausbildung" placeholder="z.B. Fachinformatiker" />
              </label>
            </div>
            <div class="form-row">
              <label>Autoführerschein
                <select [(ngModel)]="draft.autofuehrerschein">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of fuehrerscheinOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Fachspezifische Zertifikate
                <input [(ngModel)]="draft.zertifikate" placeholder="z.B. AWS, PMP" />
              </label>
            </div>

            <div class="section-title">Berufserfahrung</div>
            <label>Allgemeiner Schwerpunkt
              <select [(ngModel)]="draft.allgemeinerSchwerpunkt">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
              </select>
            </label>
            <label>Fachlicher Skill
              <textarea rows="4" [(ngModel)]="draft.fachlicherSkill" placeholder="Fachlicher Skill"></textarea>
            </label>
            <label>Branchenkenntnisse
              <textarea rows="4" [(ngModel)]="draft.branchenkenntnisse" placeholder="z.B. IT, Automotive"></textarea>
            </label>
            <label>Aktuelle Tätigkeiten
              <input [(ngModel)]="draft.aktuelleTaetigkeiten" placeholder="Aktuelle Tätigkeiten" />
            </label>
            <label>Aktuelle Position
              <input [(ngModel)]="draft.aktuellePosition" placeholder="z.B. Senior Developer" />
            </label>

            <div class="section-title">Wechsel & Zukunft</div>
            <label>Wechselgründe
              <input [(ngModel)]="draft.wechselgruende" placeholder="Wechselgründe" />
            </label>
            <label>Zukünftige Position / Tätigkeiten
              <input [(ngModel)]="draft.zukuenftigePositionTaetigkeiten" placeholder="Gewünschte Position" />
            </label>
            <div class="form-row">
              <label>Kündigungsfrist
                <input [(ngModel)]="draft.kuendigungsfrist" placeholder="z.B. 3 Monate" />
              </label>
              <label>Erstes Online-Meeting
                <input [(ngModel)]="draft.erstesOnlineMeeting" placeholder="z.B. KW 22, 10:00 Uhr" />
              </label>
            </div>
            <label>Firmen selbst beworben
              <input [(ngModel)]="draft.firmenSelbevorben" placeholder="z.B. Siemens, BMW" />
            </label>
            <label>Firmen No-Go
              <input [(ngModel)]="draft.firmenNogo" placeholder="z.B. XYZ GmbH" />
            </label>

            <div class="section-title">Kontakt Informationen</div>
            <label>E-Mail
              <div class="input-with-btn">
                <input [(ngModel)]="draft.email" placeholder="E-Mail Adresse" />
                <button class="btn-link" (click)="copyToClipboard(draft.email)" [disabled]="!draft.email">📋</button>
              </div>
              <span class="field-error" *ngIf="kandidatErrors['email']">{{ kandidatErrors['email'] }}</span>
            </label>
            <label>Telefon
              <div class="input-with-btn">
                <input [(ngModel)]="draft.telefon" placeholder="z.B. +49 30 1234567" />
                <button class="btn-link" (click)="copyToClipboard(draft.telefon)" [disabled]="!draft.telefon">📋</button>
              </div>
              <span class="field-error" *ngIf="kandidatErrors['telefon']">{{ kandidatErrors['telefon'] }}</span>
            </label>
            <label>LinkedIn Profil
              <div class="input-with-btn">
                <input [(ngModel)]="draft.linkedinProfil" placeholder="LinkedIn-URL" />
                <button class="btn-link" (click)="openLink(draft.linkedinProfil)" [disabled]="!draft.linkedinProfil">↗</button>
              </div>
            </label>
            <label>Xing Profil
              <div class="input-with-btn">
                <input [(ngModel)]="draft.xingProfil" placeholder="Xing-URL" />
                <button class="btn-link" (click)="openLink(draft.xingProfil)" [disabled]="!draft.xingProfil">↗</button>
              </div>
            </label>

            <div class="section-title">Dokumente</div>

            <div class="dokument-list" *ngIf="dokumente.length || stagedDokumente.length">
              <div class="dokument-item" *ngFor="let d of dokumente">
                <span class="dokument-typ-badge">{{ d.dokumentTyp }}</span>
                <span class="dokument-name" [title]="d.dateiname">{{ d.dateiname }}</span>
                <span class="dokument-size">{{ formatBytes(d.dateigroesse) }}</span>
                <button class="btn-link" (click)="downloadDokument(d)" title="Herunterladen">↓</button>
                <button class="btn-link btn-danger" (click)="deleteDokument(d.id)" title="Löschen">✕</button>
              </div>
              <div class="dokument-item dokument-item--pending" *ngFor="let s of stagedDokumente; let i = index">
                <span class="dokument-typ-badge">{{ s.dokumentTyp }}</span>
                <span class="dokument-name" [title]="s.file.name">{{ s.file.name }}</span>
                <span class="dokument-size">{{ formatBytes(s.file.size) }}</span>
                <span class="pending-label">ausstehend</span>
                <button class="btn-link btn-danger" (click)="removeStagedDokument(i)" title="Entfernen">✕</button>
              </div>
            </div>
            <p class="hint" *ngIf="!dokumente.length && !stagedDokumente.length">Keine Dokumente vorhanden.</p>

            <div class="upload-row">
              <select [(ngModel)]="newDokumentTyp" class="dokument-typ-select">
                <option *ngFor="let o of dokumentTypOptions" [value]="o.value">{{ o.label }}</option>
              </select>
              <label class="btn-upload">
                + Dokument hochladen
                <input type="file" style="display:none"
                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                       (change)="onFileSelected($event)" />
              </label>
            </div>
            <span class="field-error" *ngIf="dokumentUploadError">{{ dokumentUploadError }}</span>

          </div>

          <div class="modal-actions">
            <button class="btn-save" (click)="saveKandidat()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    h1 { margin: 0; color: #1f2a44; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }
    .search-input {
      padding: 8px 12px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 14px; width: 280px;
    }
    .search-input:focus { outline: none; border-color: #3b5bdb; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .btn-add:hover { background: #2f4ac7; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    th { background: #f5f7fc; color: #1f2a44; font-size: 13px; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e9f3; white-space: nowrap; }
    td { padding: 10px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #f0f2f7; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafd; }
    tr.clickable { cursor: pointer; }
    .empty { text-align: center; color: #999; padding: 24px; }
    .doc-col { text-align: center; width: 60px; }
    .doc-col input[type=checkbox] { cursor: default; accent-color: #3b5bdb; width: 15px; height: 15px; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px 28px 20px;
      width: 660px; max-width: 95vw; max-height: 88vh;
      display: flex; flex-direction: column;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .modal h2 { margin: 0 0 16px; color: #1f2a44; font-size: 18px; flex-shrink: 0; }
    .modal-body { overflow-y: auto; flex: 1; padding-right: 4px; }
    .section-title {
      font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase;
      letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px;
    }
    .section-title:first-child { margin-top: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 12px; }
    input, select, textarea {
      padding: 7px 10px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 13px; background: white;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #3b5bdb; }
    textarea { resize: vertical; font-family: inherit; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; flex-shrink: 0; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .input-with-btn { display: flex; gap: 6px; }
    .input-with-btn input { flex: 1; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
    .input-suffix-wrapper { display: flex; align-items: stretch; border: 1px solid #dfe3ee; border-radius: 6px; overflow: hidden; }
    .input-suffix-wrapper:focus-within { border-color: #3b5bdb; }
    .input-suffix-wrapper input { flex: 1; border: none; outline: none; background: transparent; min-width: 0; }
    .input-suffix { display: flex; align-items: center; padding: 0 8px; background: #f1f3f8; color: #888; font-size: 12px; white-space: nowrap; border-left: 1px solid #dfe3ee; pointer-events: none; user-select: none; }
    .dokument-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .dokument-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: #f5f7fc; border-radius: 6px; border: 1px solid #e5e9f3; }
    .dokument-item--pending { border-style: dashed; background: #fafbff; }
    .dokument-typ-badge { font-size: 10px; font-weight: 700; color: #3b5bdb; background: #e8ecfa; border-radius: 4px; padding: 2px 6px; white-space: nowrap; flex-shrink: 0; }
    .dokument-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dokument-size { font-size: 11px; color: #888; white-space: nowrap; flex-shrink: 0; }
    .pending-label { font-size: 11px; color: #aaa; font-style: italic; white-space: nowrap; flex-shrink: 0; }
    .btn-danger { color: #e03131; }
    .btn-danger:hover:not(:disabled) { background: #ffeaea; border-color: #e03131; }
    .upload-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; margin-bottom: 6px; }
    .dokument-typ-select { padding: 7px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 13px; background: white; }
    .btn-upload { display: inline-block; padding: 7px 14px; background: #f1f3f8; border: 1px dashed #3b5bdb; border-radius: 6px; font-size: 13px; color: #3b5bdb; cursor: pointer; white-space: nowrap; }
    .btn-upload:hover { background: #e8ecfa; }
    .interview-import-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 10px 14px; background: #f0f4ff; border: 1px solid #c5d0f5; border-radius: 8px; }
    .btn-interview-import { display: inline-block; padding: 7px 14px; background: #3b5bdb; color: white; border-radius: 6px; font-size: 13px; cursor: pointer; white-space: nowrap; margin: 0; }
    .btn-interview-import:hover { background: #2f4ac7; }
    .import-status { font-size: 12px; color: #3b5bdb; }
  `]
})
export class KandidatenComponent implements OnInit {
  private service = inject(KandidatService);
  private dokumentService = inject(KandidatDokumentService);
  private xlsxImportService = inject(XlsxImportService);

  items: Kandidat[] = [];
  searchText = '';

  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;
  readonly sprachniveauOptions = SPRACHNIVEAU_OPTIONS;
  readonly fuehrerscheinOptions = FUEHRERSCHEIN_OPTIONS;
  readonly schwerpunktOptions = SCHWERPUNKT_OPTIONS;
  readonly dokumentTypOptions = DOKUMENT_TYP_OPTIONS;

  addModalOpen = false;
  editingId: string | null = null;
  draft: Partial<Kandidat> = {};
  kandidatErrors: Record<string, string> = {};

  dokumente: KandidatDokument[] = [];
  stagedDokumente: StagedDokument[] = [];
  newDokumentTyp: DokumentTyp = 'CV';
  dokumentUploadError = '';
  importStatus = '';

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.service.getAll().subscribe(list => (this.items = list));
  }

  get filtered(): Kandidat[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(k =>
      k.vorname?.toLowerCase().includes(q) ||
      k.nachname?.toLowerCase().includes(q)
    );
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  openAddModal(): void {
    this.editingId = null;
    this.draft = {};
    this.kandidatErrors = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
    this.importStatus = '';
    this.newDokumentTyp = 'CV';
    this.addModalOpen = true;
  }

  openEditModal(k: Kandidat): void {
    this.editingId = k.id ?? null;
    this.draft = { ...k };
    const mn = k.gehaltMinimum, mx = k.gehaltMaximum;
    this.draft.gehalt = mn != null && mx != null ? `${mn}-${mx}` : mn != null ? `${mn}` : mx != null ? `${mx}` : undefined;
    this.kandidatErrors = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
    this.importStatus = '';
    this.newDokumentTyp = 'CV';
    if (k.id) this.loadDokumente(k.id);
    this.addModalOpen = true;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.addModalOpen) this.closeAddModal(); }

  closeAddModal(): void {
    this.addModalOpen = false;
    this.editingId = null;
    this.draft = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
  }

  filterGehalt(e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^0-9,\-]/g, '');
    this.draft.gehalt = el.value;
  }

  private parseGehalt(raw: string | undefined, type: 'kandidat' | 'suchauftrag'): [number | undefined, number | undefined] {
    const s = raw?.replace(/,/g, '').trim() ?? '';
    if (!s) return [undefined, undefined];
    const dash = s.indexOf('-');
    if (dash > 0) {
      const min = parseFloat(s.slice(0, dash));
      const max = parseFloat(s.slice(dash + 1));
      return [isNaN(min) ? undefined : min, isNaN(max) ? undefined : max];
    }
    const val = parseFloat(s);
    const v = isNaN(val) ? undefined : val;
    return type === 'kandidat' ? [v, undefined] : [undefined, v];
  }

  saveKandidat(): void {
    [this.draft.gehaltMinimum, this.draft.gehaltMaximum] = this.parseGehalt(this.draft.gehalt, 'kandidat');
    const onError = (err: any) => {
      if (err.status === 400) this.kandidatErrors = err.error ?? {};
    };
    if (this.editingId) {
      this.service.update(this.editingId, this.draft as Kandidat).subscribe({
        next: () => { this.reload(); this.closeAddModal(); },
        error: onError,
      });
    } else {
      this.service.create(this.draft as Kandidat).subscribe({
        next: (created) => {
          this.uploadStagedDokumente(created.id!, () => {
            this.reload();
            this.closeAddModal();
          });
        },
        error: onError,
      });
    }
  }

  private uploadStagedDokumente(kandidatId: string, onDone: () => void): void {
    console.log('[uploadStagedDokumente] kandidatId:', kandidatId, 'staged count:', this.stagedDokumente.length);
    if (!this.stagedDokumente.length) { onDone(); return; }
    const staged = [...this.stagedDokumente];
    let remaining = staged.length;
    staged.forEach(s => {
      this.dokumentService.upload(kandidatId, s.file, s.dokumentTyp).subscribe({
        next: () => { if (--remaining === 0) onDone(); },
        error: (err) => {
          const msg = err.error?.error ?? err.error?.message ?? err.statusText ?? 'Unbekannter Fehler';
          this.dokumentUploadError = `Upload von "${s.file.name}" fehlgeschlagen: ${msg}`;
          if (--remaining === 0) onDone();
        },
      });
    });
  }

  loadDokumente(kandidatId: string): void {
    this.dokumentService.list(kandidatId).subscribe({
      next: docs => this.dokumente = docs,
      error: () => this.dokumente = [],
    });
  }

  onInterviewImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const editingId = this.editingId;
    console.log('[Interview Import] editingId:', editingId, 'file:', file.name);
    this.importStatus = 'Wird importiert…';
    this.xlsxImportService.parseInterviewFile(file).then(parsed => {
      const filteredParsed = Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
      this.draft = { ...this.draft, ...filteredParsed };
      console.log('[Interview Import] editingId after parse:', editingId, 'stagedDocs:', this.stagedDokumente.length);
      if (editingId) {
        console.log('[Interview Import] Uploading directly for existing Kandidat...');
        this.dokumentService.upload(editingId, file, 'INTERVIEW').subscribe({
          next: doc => {
            this.dokumente = [...this.dokumente, doc];
            this.importStatus = 'Import und Speichern erfolgreich.';
            input.value = '';
            this.reload();
          },
          error: err => {
            const msg = err.error?.error ?? err.error?.message ?? err.statusText ?? 'Unbekannter Fehler';
            this.importStatus = 'Formular importiert, aber Speichern fehlgeschlagen: ' + msg;
            input.value = '';
          },
        });
      } else {
        this.stagedDokumente = [...this.stagedDokumente, { file, dokumentTyp: 'INTERVIEW' }];
        console.log('[Interview Import] Staged. Total staged:', this.stagedDokumente.length);
        this.importStatus = 'Import erfolgreich. Datei wird beim Speichern hochgeladen.';
        input.value = '';
      }
    }).catch(err => {
      console.error('Interview import error:', err);
      this.importStatus = 'Import fehlgeschlagen: ' + (err?.message ?? 'Unbekannter Fehler');
      input.value = '';
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.dokumentUploadError = '';

    if (this.editingId) {
      this.dokumentService.upload(this.editingId, file, this.newDokumentTyp).subscribe({
        next: doc => {
          this.dokumente = [...this.dokumente, doc];
          input.value = '';
          this.reload();
        },
        error: err => {
          this.dokumentUploadError = err.error?.error ?? 'Upload fehlgeschlagen.';
          input.value = '';
        },
      });
    } else {
      this.stagedDokumente = [...this.stagedDokumente, { file, dokumentTyp: this.newDokumentTyp }];
      input.value = '';
    }
  }

  removeStagedDokument(index: number): void {
    this.stagedDokumente = this.stagedDokumente.filter((_, i) => i !== index);
  }

  deleteDokument(docId: string): void {
    if (!this.editingId) return;
    this.dokumentService.delete(this.editingId, docId).subscribe({
      next: () => { this.dokumente = this.dokumente.filter(d => d.id !== docId); this.reload(); },
    });
  }

  downloadDokument(doc: KandidatDokument): void {
    if (!this.editingId) return;
    this.dokumentService.downloadUrl(this.editingId, doc.id).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
    });
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}