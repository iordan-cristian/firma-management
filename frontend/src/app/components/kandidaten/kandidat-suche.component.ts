import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import { Kandidat } from '../../models/kandidat.model';

/**
 * Kandidaten search: name search, "Abgelaufene DSGVO-Bestätigung" filter and result table.
 * Loads the Kandidaten itself; call reload() after changes made elsewhere.
 * Content marked with [sucheTitle] is shown left in the toolbar, other content right after the search field.
 */
@Component({
  selector: 'app-kandidat-suche',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <ng-content select="[sucheTitle]"></ng-content>
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
        <ng-content></ng-content>
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
          <tr *ngFor="let k of filtered" (dblclick)="kandidatSelected.emit(k)" class="clickable" [class.row-dsgvo-expired]="isDsgvoAbgelaufen(k)">
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
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .checkbox-filter { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; white-space: nowrap; cursor: pointer; }
    .checkbox-filter input[type=checkbox] { cursor: pointer; accent-color: #3b5bdb; width: 15px; height: 15px; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }
    .search-input {
      padding: 8px 12px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 14px; width: 280px;
    }
    .search-input:focus { outline: none; border-color: #3b5bdb; }

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
export class KandidatSucheComponent implements OnInit {
  private service = inject(KandidatService);

  /** Emits the Kandidat whose row was double-clicked. */
  @Output() kandidatSelected = new EventEmitter<Kandidat>();

  items: Kandidat[] = [];
  searchText = '';
  onlyAbgelaufeneDsgvo = false;

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
