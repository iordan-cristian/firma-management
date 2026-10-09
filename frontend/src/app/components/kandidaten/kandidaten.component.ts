import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Kandidat } from '../../models/kandidat.model';
import { KandidatDialogComponent } from './kandidat-dialog.component';
import { KandidatSucheComponent } from './kandidat-suche.component';

@Component({
  selector: 'app-kandidaten',
  standalone: true,
  imports: [CommonModule, FormsModule, KandidatDialogComponent, KandidatSucheComponent],
  template: `
    <div class="page">
      <app-kandidat-suche (results)="suchErgebnis = $event">
        <h1 sucheTitle>Kandidaten</h1>
        <label sucheFilter class="checkbox-filter">
          <input type="checkbox" [(ngModel)]="onlyAbgelaufeneDsgvo" />
          Abgelaufene DSGVO-Bestätigung
        </label>
        <button class="btn-add" (click)="openAddModal()">+ Kandidat</button>
      </app-kandidat-suche>

      <p class="hint">{{ kandidaten.length }} Kandidat(en) gefunden</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>PLZ / Ort</th>
              <th>Aktuelle Position</th>
              <th>Aktuelle Firma</th>
              <th>Branchenkenntnisse</th>
              <th>Deutsch</th>
              <th>Englisch</th>
              <th class="doc-col">CV</th>
              <th class="doc-col">Interview</th>
              <th class="doc-col">DSGVO</th>
              <th>Bestätigungs Datum</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let k of kandidaten" (dblclick)="openEditModal(k)" class="clickable" [class.row-dsgvo-expired]="isDsgvoAbgelaufen(k)">
              <td>{{ k.titel ?? '–' }}</td>
              <td>{{ k.vorname ?? '–' }}</td>
              <td>{{ k.nachname ?? '–' }}</td>
              <td>{{ k.postleitzahl ?? '' }} {{ k.ort ?? '–' }}</td>
              <td>{{ k.aktuellePosition ?? '–' }}</td>
              <td>{{ k.aktuelleFirma ?? '–' }}</td>
              <td>{{ k.branchenkenntnisse ?? '–' }}</td>
              <td>{{ k.deutsch ?? '–' }}</td>
              <td>{{ k.englisch ?? '–' }}</td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('CV')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('INTERVIEW')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('DSGVO')" disabled /></td>
              <td>{{ formatDsgvoDatum(k.dsgvoBestaetigungsDatum) ?? '–' }}</td>
            </tr>
            <tr *ngIf="!kandidaten.length">
              <td colspan="13" class="empty">Keine Kandidaten gefunden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Kandidat Popup -->
      <app-kandidat-dialog
        *ngIf="dialogKandidat"
        [kandidat]="dialogKandidat"
        (saved)="onKandidatSaved()"
        (changed)="reload()"
        (close)="closeDialog()"
      ></app-kandidat-dialog>
    </div>
  `,
  styles: [`
    h1 { margin: 0; color: #1f2a44; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .btn-add:hover { background: #2f4ac7; }
    .checkbox-filter { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; white-space: nowrap; cursor: pointer; }
    .checkbox-filter input[type=checkbox] { cursor: pointer; accent-color: #3b5bdb; width: 15px; height: 15px; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }

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
    tr.row-dsgvo-expired td { background: #fdecea; }
    tr.row-dsgvo-expired:hover td { background: #fbdcd9; }
  `]
})
export class KandidatenComponent {
  @ViewChild(KandidatSucheComponent) private suche?: KandidatSucheComponent;

  /** Kandidaten as delivered by the search. */
  suchErgebnis: Kandidat[] = [];
  onlyAbgelaufeneDsgvo = false;

  /** Open Kandidat dialog: null = closed, {} = new Kandidat, otherwise the Kandidat being edited. */
  dialogKandidat: Partial<Kandidat> | null = null;

  /** Search result, narrowed to expired DSGVO-Bestätigungen if the checkbox is set. */
  get kandidaten(): Kandidat[] {
    return this.onlyAbgelaufeneDsgvo
      ? this.suchErgebnis.filter(k => this.isDsgvoAbgelaufen(k))
      : this.suchErgebnis;
  }

  reload(): void {
    this.suche?.reload();
  }

  /** True if the DSGVO-Bestätigung of the Kandidat is older than one year. */
  isDsgvoAbgelaufen(k: Kandidat): boolean {
    const raw = k.dsgvoBestaetigungsDatum;
    if (!raw) return false;
    const match = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (!match) return false;
    const [, day, month, year] = match;
    const date = new Date(+year, +month - 1, +day);
    if (isNaN(date.getTime())) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  }

  formatDsgvoDatum(value?: string): string | undefined {
    return value ? value.replace(/\//g, '.') : undefined;
  }

  openAddModal(): void {
    this.dialogKandidat = {};
  }

  openEditModal(k: Kandidat): void {
    this.dialogKandidat = k;
  }

  closeDialog(): void {
    this.dialogKandidat = null;
  }

  onKandidatSaved(): void {
    this.reload();
    this.closeDialog();
  }
}
