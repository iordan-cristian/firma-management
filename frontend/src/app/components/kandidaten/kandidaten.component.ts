import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import {
  Kandidat,
  GESCHLECHT_OPTIONS,
  TITEL_OPTIONS,
  SPRACHNIVEAU_OPTIONS,
  FUEHRERSCHEIN_OPTIONS,
  SCHWERPUNKT_OPTIONS,
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
            </tr>
            <tr *ngIf="!filtered.length">
              <td colspan="8" class="empty">Keine Kandidaten gefunden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Kandidat Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen" (click)="closeAddModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingId ? 'Kandidat bearbeiten' : 'Neuer Kandidat' }}</h2>
          <div class="modal-body">

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
              <label>Familienstand
                <input [(ngModel)]="draft.familienstand" placeholder="z.B. ledig, verheiratet" />
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
              <label>Gehaltsrange
                <input [(ngModel)]="draft.gehaltsrange" placeholder="z.B. 60000 oder 55000-70000" />
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
                <input [(ngModel)]="draft.fachspezifischeZertifikate" placeholder="z.B. AWS, PMP" />
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
              <input [(ngModel)]="draft.fachlicherSkill" placeholder="Fachlicher Skill" />
            </label>
            <label>Branchenkenntnisse
              <input [(ngModel)]="draft.branchenkenntnisse" placeholder="z.B. IT, Automotive" />
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
    input, select {
      padding: 7px 10px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 13px; background: white;
    }
    input:focus, select:focus { outline: none; border-color: #3b5bdb; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; flex-shrink: 0; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
  `]
})
export class KandidatenComponent implements OnInit {
  private service = inject(KandidatService);

  items: Kandidat[] = [];
  searchText = '';

  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;
  readonly sprachniveauOptions = SPRACHNIVEAU_OPTIONS;
  readonly fuehrerscheinOptions = FUEHRERSCHEIN_OPTIONS;
  readonly schwerpunktOptions = SCHWERPUNKT_OPTIONS;

  addModalOpen = false;
  editingId: string | null = null;
  draft: Partial<Kandidat> = {};

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

  openAddModal(): void {
    this.editingId = null;
    this.draft = {};
    this.addModalOpen = true;
  }

  openEditModal(k: Kandidat): void {
    this.editingId = k.id ?? null;
    this.draft = { ...k };
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
    this.editingId = null;
    this.draft = {};
  }

  saveKandidat(): void {
    if (this.editingId) {
      this.service.update(this.editingId, this.draft as Kandidat).subscribe(() => {
        this.reload();
        this.closeAddModal();
      });
    } else {
      this.service.create(this.draft as Kandidat).subscribe(() => {
        this.reload();
        this.closeAddModal();
      });
    }
  }
}