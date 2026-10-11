import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { KandidatService } from '../../../services/kandidat.service';
import { VerknuepfungService } from '../../../services/verknuepfung.service';
import { FirmaService } from '../../../services/firma.service';
import { SuchauftragService } from '../../../services/suchauftrag.service';
import { Kandidat } from '../../../models/kandidat.model';
import { Verknuepfung } from '../../../models/verknuepfung.model';
import { VERKNUEPFUNG_STATUS_COLORS, VERKNUEPFUNG_STATUS_OPTIONS, VERKNUEPFUNG_STATUS_ORDER, VerknuepfungStatus } from '../../../models/verknuepfung-status.model';
import { NeueVerknuepfungFirmaAuswaehlenComponent, FirmaAusgewaehltEvent } from '../../verknuepfungen/neue-verknuepfung-firma-auswaehlen.component';
import { KandidatDialogComponent } from '../../kandidaten/kandidat-dialog.component';

interface KandidatRow {
  kandidat: Kandidat;
  name: string;
  fachlicherSkill: string;
  gehalt: string;
  wohnort: string;
  vorgestelltBei: string;
  gebuehr: string;
  meinAnteil: string;
  links: Verknuepfung[];
  sortDate: number;
  highestStatus: number;
  highestStatusName?: VerknuepfungStatus;
}

interface MonthGroup {
  key: number;
  label: string;
  rows: KandidatRow[];
}

@Component({
  selector: 'app-kandidaten-perm-bestand',
  standalone: true,
  imports: [CommonModule, FormsModule, NeueVerknuepfungFirmaAuswaehlenComponent, KandidatDialogComponent],
  host: { '(document:click)': 'closeMenu()' },
  template: `
    <div class="wrap">
      <div class="toolbar">
        <button type="button" class="btn-add" (click)="openNeuerKandidat()">+ Kandidat</button>
      </div>
      <p class="hint" *ngIf="loading">Lade Daten...</p>

      <table *ngIf="!loading">
        <colgroup>
          <col style="width: 30%;" />
          <col style="width: 25%;" />
          <col style="width: 22%;" />
          <col style="width: 23%;" />
        </colgroup>
        <tbody>
          <ng-container *ngFor="let group of groups">
            <tr class="group-row">
              <td colspan="4">{{ group.label }}</td>
            </tr>
            <ng-container *ngFor="let row of group.rows; let i = index">
              <tr
                [class.entry-odd]="i % 2 === 1"
                [class.entry-even]="i % 2 === 0"
                class="entry-row-1"
                [class.status-colored]="!!row.highestStatusName"
                [style]="statusStyle(row.highestStatusName)"
                (dblclick)="toggleExpanded(row.kandidat)"
                (contextmenu)="openMenu($event, row.kandidat)"
              >
                <td><strong>Name: </strong> {{ row.name }}</td>
                <td><strong>Fachliche Skills: </strong> {{ row.fachlicherSkill }}</td>
                <td><strong>Gehalt: </strong> {{ row.gehalt }}</td>
                <td><strong>Wohnort: </strong> {{ row.wohnort }}</td>
              </tr>
              <tr
                [class.entry-odd]="i % 2 === 1"
                [class.entry-even]="i % 2 === 0"
                class="entry-row-2"
                [class.status-colored]="!!row.highestStatusName"
                [style]="statusStyle(row.highestStatusName)"
                (dblclick)="toggleExpanded(row.kandidat)"
                (contextmenu)="openMenu($event, row.kandidat)"
              >
                <td colspan="2"><strong>Vorgestellt bei: </strong> {{ row.vorgestelltBei }}</td>
                <td><strong>Gebühr: </strong> {{ row.gebuehr }}</td>
                <td><strong>Mein Anteil: </strong> {{ row.meinAnteil }}</td>
              </tr>
              <tr class="detail-row" *ngIf="isExpanded(row.kandidat)">
                <td colspan="4">
                  <table class="verknuepfung-table">
                    <colgroup>
                      <col style="width: 14%;" />
                      <col style="width: 16%;" />
                      <col style="width: 9%;" />
                      <col style="width: 9%;" />
                      <col style="width: 10%;" />
                      <col style="width: 42%;" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Firma</th>
                        <th>Suche nach</th>
                        <th>Gebühren</th>
                        <th>Mein Anteil</th>
                        <th>Status</th>
                        <th>Kommentar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        *ngFor="let link of row.links"
                        [class.status-colored]="!!link.verknuepfungStatus"
                        [style]="statusStyle(link.verknuepfungStatus)"
                      >
                        <td>{{ firmaName(link.firmaId) }}</td>
                        <td>{{ sucheNach(link.suchauftragId) }}</td>
                        <td contenteditable="true" [textContent]="link.gebuehren ?? ''" (blur)="onGebuehrenEdited(row, link, $event)"></td>
                        <td contenteditable="true" [textContent]="link.mainAnteil ?? ''" (blur)="onMainAnteilEdited(row, link, $event)"></td>
                        <td>
                          <select [ngModel]="link.verknuepfungStatus ?? ''" (ngModelChange)="onStatusEdited(row, link, $event)">
                            <option value="">-</option>
                            <option *ngFor="let opt of statusOptions" [value]="opt">{{ opt }}</option>
                          </select>
                        </td>
                        <td contenteditable="true" [textContent]="link.verknuepfungStatusKommentar ?? ''" (blur)="onKommentarEdited(row, link, $event)"></td>
                      </tr>
                      <tr *ngIf="row.links.length === 0">
                        <td colspan="6" class="empty-links">Keine Verknüpfungen vorhanden.</td>
                      </tr>
                      <tr>
                        <td colspan="6"><button type="button" class="new-verknuepfung-btn" (click)="openNeueVerknuepfung(row)">+ neue Verknüpfung</button></td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="save-error" *ngIf="saveError">{{ saveError }}</p>
                </td>
              </tr>
            </ng-container>
          </ng-container>
          <tr *ngIf="groups.length === 0">
            <td colspan="4" class="empty">Keine Kandidaten vorhanden.</td>
          </tr>
        </tbody>
      </table>

      <app-neue-verknuepfung-firma-auswaehlen
        *ngIf="neueVerknuepfungRow"
        [kandidat]="neueVerknuepfungRow.kandidat"
        [kandidatName]="neueVerknuepfungRow.name"
        (firmaAusgewaehlt)="onFirmaAusgewaehlt($event)"
        (close)="closeNeueVerknuepfung()"
      ></app-neue-verknuepfung-firma-auswaehlen>

      <!-- Custom right-click context menu -->
      <div class="ctx-menu"
           *ngIf="menuKandidat"
           [style.top.px]="menuY"
           [style.left.px]="menuX"
           (click)="$event.stopPropagation()">
        <button (click)="openKandidatDialog()">Kandidat anzeigen</button>
      </div>

      <app-kandidat-dialog
        *ngIf="dialogKandidat"
        [kandidat]="dialogKandidat"
        (saved)="onKandidatSaved()"
        (changed)="load()"
        (close)="closeKandidatDialog()"
      ></app-kandidat-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .wrap { display: flex; flex-direction: column; height: 100%; }
    .hint { font-size: 13px; color: #555; margin: 0; }
    .toolbar { flex: none; display: flex; justify-content: flex-end; padding: 0 0 8px; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; white-space: nowrap; }
    .btn-add:hover { background: #2f4ac7; }
    .wrap > table { flex: 1 1 auto; height: auto; }
    table { width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse; background: white; }
    td {
      padding: 6px 10px;
      font-size: 13px;
      color: #111;
      border-left: 1px solid #e5e9f3;
      border-right: 1px solid #e5e9f3;
      vertical-align: top;
      word-break: break-word;
    }
    td strong { font-weight: 700; color: #1f2a44; }
    .entry-row-1 td { border-top: 1px solid #e5e9f3; border-bottom: none; padding-bottom: 2px; }
    .entry-row-2 td { border-top: none; border-bottom: 1px solid #d7ddec; padding-top: 2px; }
    .entry-even td { background: #fff; }
    .entry-odd td { background: #f7f8fc; }
    .entry-row-1, .entry-row-2 { cursor: pointer; }
    tr.status-colored > td { background: var(--status-bg); color: var(--status-fg); }
    tr.status-colored > td strong { color: inherit; }
    .group-row td {
      font-size: 13px;
      font-weight: 700;
      color: #1f2a44;
      background: #e9edf7;
      border: 1px solid #d7ddec;
      cursor: default;
    }
    .empty { padding: 16px 10px; text-align: center; color: #777; cursor: default; }
    .detail-row td { background: #fafbfd; border-top: none; border-bottom: 1px solid #d7ddec; padding: 10px; }
    .verknuepfung-table { width: 100%; height: auto; table-layout: fixed; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .verknuepfung-table th {
      background: #f5f7fc;
      color: #1f2a44;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 8px;
      text-align: left;
      border: 1px solid #d7ddec;
      white-space: nowrap;
    }
    .verknuepfung-table td {
      font-size: 12px;
      padding: 6px 8px;
      border: 1px solid #e5e9f3;
      cursor: default;
      word-break: break-word;
    }
    .verknuepfung-table td[contenteditable='true'] { cursor: text; }
    .verknuepfung-table td[contenteditable='true']:hover { background: #f8f9fd; color: #111; }
    .verknuepfung-table td[contenteditable='true']:focus {
      color: #111;
      outline: 2px solid #6a8ee0;
      outline-offset: -2px;
      background: #fff;
    }
    .verknuepfung-table select {
      width: 100%;
      max-width: 100%;
      font-size: 12px;
      padding: 2px 4px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .empty-links { text-align: center; color: #777; cursor: default; }
    .new-verknuepfung-btn {
      background: #eef1fa;
      border: 1px solid #c7cfe6;
      color: #1f2a44;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .new-verknuepfung-btn:hover { background: #dde3f5; }
    .save-error { margin: 6px 0 0; font-size: 12px; color: #b3261e; }
    .ctx-menu {
      position: fixed; background: white; border: 1px solid #dfe3ee; border-radius: 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      min-width: 180px; z-index: 2100; overflow: hidden;
    }
    .ctx-menu button { background: white; border: none; text-align: left; padding: 10px 14px; font-size: 14px; cursor: pointer; }
    .ctx-menu button:hover { background: #eef2fb; }
  `]
})
export class KandidatenPermBestandComponent implements OnInit {
  private kandidatService = inject(KandidatService);
  private verknuepfungService = inject(VerknuepfungService);
  private firmaService = inject(FirmaService);
  private suchauftragService = inject(SuchauftragService);

  loading = true;
  groups: MonthGroup[] = [];
  statusOptions = VERKNUEPFUNG_STATUS_OPTIONS;
  saveError: string | null = null;
  neueVerknuepfungRow: KandidatRow | null = null;
  /** Kandidat whose right-click menu is open. */
  menuKandidat: Kandidat | null = null;
  menuX = 0;
  menuY = 0;
  /** Open Kandidat dialog: null = closed, {} = new Kandidat, otherwise the Kandidat being shown. */
  dialogKandidat: Partial<Kandidat> | null = null;

  private firmaNameById = new Map<string, string>();
  private sucheNachById = new Map<string, string>();
  private expandedKandidatIds = new Set<string>();

  private static readonly MONTH_FORMATTER = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      kandidaten: this.kandidatService.getAll(),
      firmen: this.firmaService.getAll(),
      suchauftraege: this.suchauftragService.getAll(),
    }).subscribe(({ kandidaten, firmen, suchauftraege }) => {
      this.firmaNameById = new Map<string, string>(
        firmen.filter(f => !!f.id).map(f => [f.id as string, f.name ?? ''])
      );
      this.sucheNachById = new Map<string, string>(
        suchauftraege.filter(s => !!s.id).map(s => [s.id as string, s.sucheNach ?? ''])
      );

      const withLinks$ = kandidaten
        .filter(k => !!k.id)
        .map(k =>
          this.verknuepfungService.getVerknuepfungenForKandidat(k.id as string).pipe(
            map(links => ({ kandidat: k, links }))
          )
        );

      forkJoin(withLinks$).subscribe(results => {
        this.groups = this.buildGroups(results);
        this.loading = false;
      });
    });
  }

  openMenu(event: MouseEvent, kandidat: Kandidat): void {
    event.preventDefault();
    this.menuKandidat = kandidat;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
  }

  closeMenu(): void {
    this.menuKandidat = null;
  }

  openKandidatDialog(): void {
    this.dialogKandidat = this.menuKandidat;
    this.closeMenu();
  }

  openNeuerKandidat(): void {
    this.dialogKandidat = {};
  }

  closeKandidatDialog(): void {
    this.dialogKandidat = null;
  }

  onKandidatSaved(): void {
    this.closeKandidatDialog();
    this.load();
  }

  toggleExpanded(kandidat: Kandidat): void {
    if (!kandidat.id) return;
    const wasExpanded = this.expandedKandidatIds.has(kandidat.id);
    // Only one row can be expanded at a time
    this.expandedKandidatIds.clear();
    if (!wasExpanded) this.expandedKandidatIds.add(kandidat.id);
  }

  isExpanded(kandidat: Kandidat): boolean {
    return !!kandidat.id && this.expandedKandidatIds.has(kandidat.id);
  }

  openNeueVerknuepfung(row: KandidatRow): void {
    this.neueVerknuepfungRow = row;
  }

  closeNeueVerknuepfung(): void {
    this.neueVerknuepfungRow = null;
  }

  onFirmaAusgewaehlt({ verknuepfung, firma }: FirmaAusgewaehltEvent): void {
    const row = this.neueVerknuepfungRow;
    this.closeNeueVerknuepfung();
    if (!row) return;
    // The Firma may have just been created in the dialog
    if (firma.id) this.firmaNameById.set(firma.id, firma.name ?? '');
    row.links.push(verknuepfung);
    this.refreshAggregates(row);
    this.updateHighestStatus(row);
    const group = this.groups.find(g => g.rows.includes(row));
    if (group) this.sortRows(group);
  }

  onGebuehrenEdited(row: KandidatRow, link: Verknuepfung, event: Event): void {
    link.gebuehren = this.parseEditedNumber(event);
    this.saveLink(row, link);
  }

  onMainAnteilEdited(row: KandidatRow, link: Verknuepfung, event: Event): void {
    link.mainAnteil = this.parseEditedNumber(event);
    this.saveLink(row, link);
  }

  onKommentarEdited(row: KandidatRow, link: Verknuepfung, event: Event): void {
    const text = (event.target as HTMLElement).innerText.trim();
    link.verknuepfungStatusKommentar = text || undefined;
    this.saveLink(row, link);
  }

  onStatusEdited(row: KandidatRow, link: Verknuepfung, value: string): void {
    link.verknuepfungStatus = value || undefined;
    this.updateHighestStatus(row);
    const group = this.groups.find(g => g.rows.includes(row));
    if (group) this.sortRows(group);
    this.saveLink(row, link);
  }

  private parseEditedNumber(event: Event): number | undefined {
    const text = (event.target as HTMLElement).innerText.trim().replace(',', '.');
    if (!text) return undefined;
    const value = Number(text);
    return Number.isNaN(value) ? undefined : value;
  }

  private saveLink(row: KandidatRow, link: Verknuepfung): void {
    this.refreshAggregates(row);
    if (!link.id) return;
    this.saveError = null;
    this.verknuepfungService.update(link.id, link).subscribe({
      next: updated => {
        Object.assign(link, updated);
        this.refreshAggregates(row);
      },
      error: () => { this.saveError = 'Speichern fehlgeschlagen.'; },
    });
  }

  private refreshAggregates(row: KandidatRow): void {
    row.vorgestelltBei = this.formatVorgestelltBei(row.links);
    row.gebuehr = this.formatJoined(row.links.map(l => l.gebuehren));
    row.meinAnteil = this.formatJoined(row.links.map(l => l.mainAnteil));
  }

  firmaName(firmaId?: string): string {
    return firmaId ? this.firmaNameById.get(firmaId) ?? '-' : '-';
  }

  sucheNach(suchauftragId?: string): string {
    return suchauftragId ? this.sucheNachById.get(suchauftragId) || '-' : '-';
  }

  private buildGroups(results: { kandidat: Kandidat; links: Verknuepfung[] }[]): MonthGroup[] {
    const groupsByKey = new Map<number, MonthGroup>();

    for (const { kandidat, links } of results) {
      const date = this.parseDate(kandidat.anlageDatum);
      const key = date ? date.getFullYear() * 12 + date.getMonth() : Number.NEGATIVE_INFINITY;
      const label = date ? KandidatenPermBestandComponent.MONTH_FORMATTER.format(date) : 'Ohne Anlagedatum';

      let group = groupsByKey.get(key);
      if (!group) {
        group = { key, label, rows: [] };
        groupsByKey.set(key, group);
      }

      group.rows.push(this.buildRow(kandidat, links, date));
    }

    const groups = Array.from(groupsByKey.values()).sort((a, b) => b.key - a.key);
    groups.forEach(group => this.sortRows(group));
    return groups;
  }

  /** Lowest highest-status first, then newest Anlagedatum, then name. */
  private sortRows(group: MonthGroup): void {
    group.rows.sort((a, b) =>
      a.highestStatus - b.highestStatus || b.sortDate - a.sortDate || a.name.localeCompare(b.name));
  }

  private buildRow(kandidat: Kandidat, links: Verknuepfung[], date: Date | null): KandidatRow {
    return {
      kandidat,
      name: this.formatName(kandidat),
      fachlicherSkill: kandidat.fachlicherSkill?.replace(/_/g, ' ').trim() || '-',
      gehalt: this.formatGehalt(kandidat),
      wohnort: this.formatWohnort(kandidat),
      vorgestelltBei: this.formatVorgestelltBei(links),
      gebuehr: this.formatJoined(links.map(l => l.gebuehren)),
      meinAnteil: this.formatJoined(links.map(l => l.mainAnteil)),
      links,
      sortDate: date ? date.getTime() : Number.NEGATIVE_INFINITY,
      ...this.findHighestStatus(links),
    };
  }

  private updateHighestStatus(row: KandidatRow): void {
    Object.assign(row, this.findHighestStatus(row.links));
  }

  /** Highest status among the links; order 0 when no link has a status. */
  private findHighestStatus(links: Verknuepfung[]): { highestStatus: number; highestStatusName?: VerknuepfungStatus } {
    let result: { highestStatus: number; highestStatusName?: VerknuepfungStatus } = { highestStatus: 0 };
    for (const l of links) {
      const name = l.verknuepfungStatus as VerknuepfungStatus;
      const order = VERKNUEPFUNG_STATUS_ORDER[name];
      if (order != null && order > result.highestStatus) result = { highestStatus: order, highestStatusName: name };
    }
    return result;
  }

  statusStyle(status?: string): Record<string, string> | null {
    const colors = status ? VERKNUEPFUNG_STATUS_COLORS[status as VerknuepfungStatus] : undefined;
    return colors ? { '--status-bg': colors.background, '--status-fg': colors.color } : null;
  }

  private formatName(k: Kandidat): string {
    const anrede = k.geschlecht === 'männlich' ? 'Herr' : k.geschlecht === 'weiblich' ? 'Frau' : '';
    return [anrede, k.titel, k.vorname, k.nachname].filter(Boolean).join(' ') || '-';
  }

  private formatGehalt(k: Kandidat): string {
    const min = k.gehaltMinimum;
    const max = k.gehaltMaximum;
    if (min != null && max != null) return `${min}-${max} Tausend €`;
    if (min != null) return `${min} Tausend €`;
    if (max != null) return `${max} Tausend €`;
    return '-';
  }

  private formatWohnort(k: Kandidat): string {
    const ort = k.ort?.trim();
    const umzug = k.umzugsbereitschaft?.trim();
    if (ort && umzug) return `${ort} (${umzug})`;
    if (ort) return ort;
    if (umzug) return `(${umzug})`;
    return '-';
  }

  private formatVorgestelltBei(links: Verknuepfung[]): string {
    const parts = links
      .map(l => {
        const firma = l.firmaId ? this.firmaNameById.get(l.firmaId) ?? '' : '';
        const statusPart = [l.verknuepfungStatus, l.verknuepfungStatusKommentar].filter(Boolean).join(' - ');
        if (firma && statusPart) return `${firma} (${statusPart})`;
        return firma || statusPart;
      })
      .filter(Boolean);
    return parts.length ? parts.join(', ') : '-';
  }

  private formatJoined(values: (number | undefined)[]): string {
    const parts = values.filter((v): v is number => v != null).map(v => String(v));
    return parts.length ? parts.join(' / ') : '-';
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    // Backend serializes anlageDatum as "dd/MM/yyyy" (see Kandidat.java @JsonFormat).
    const [d, m, y] = value.split('/').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
}
