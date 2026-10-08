import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import { Kandidat } from '../../models/kandidat.model';
import { KandidatDialogComponent } from './kandidat-dialog.component';

@Component({
  selector: 'app-kandidaten',
  standalone: true,
  imports: [CommonModule, FormsModule, KandidatDialogComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Kandidaten</h1>
        <div class="header-right">
          <label class="checkbox-filter">
            <input type="checkbox" [(ngModel)]="onlyAbgelaufeneDsgvo" />
            Abgelaufene DSGVO-Bestätigung
          </label>
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
            <tr *ngFor="let k of filtered" (dblclick)="openEditModal(k)" class="clickable" [class.row-dsgvo-expired]="isDsgvoAbgelaufen(k)">
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
            <tr *ngIf="!filtered.length">
              <td colspan="8" class="empty">Keine Kandidaten gefunden.</td>
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
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    h1 { margin: 0; color: #1f2a44; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .checkbox-filter { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; white-space: nowrap; cursor: pointer; }
    .checkbox-filter input[type=checkbox] { cursor: pointer; accent-color: #3b5bdb; width: 15px; height: 15px; }
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
    tr.row-dsgvo-expired td { background: #fdecea; }
    tr.row-dsgvo-expired:hover td { background: #fbdcd9; }
  `]
})
export class KandidatenComponent implements OnInit {
  private service = inject(KandidatService);

  items: Kandidat[] = [];
  searchText = '';
  onlyAbgelaufeneDsgvo = false;

  /** Open Kandidat dialog: null = closed, {} = new Kandidat, otherwise the Kandidat being edited. */
  dialogKandidat: Partial<Kandidat> | null = null;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.service.getAll().subscribe(list => (this.items = list));
  }

  get filtered(): Kandidat[] {
    const q = this.searchText.trim().toLowerCase();
    return this.items.filter(k => {
      if (q && !k.vorname?.toLowerCase().includes(q) && !k.nachname?.toLowerCase().includes(q)) return false;
      if (this.onlyAbgelaufeneDsgvo && !this.isDsgvoAbgelaufen(k)) return false;
      return true;
    });
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
}
