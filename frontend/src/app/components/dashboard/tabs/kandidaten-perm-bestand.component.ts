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
import { VERKNUEPFUNG_STATUS_OPTIONS } from '../../../models/verknuepfung-status.model';

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
}

interface MonthGroup {
  key: number;
  label: string;
  rows: KandidatRow[];
}

@Component({
  selector: 'app-kandidaten-perm-bestand',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
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
                (dblclick)="toggleExpanded(row.kandidat)"
              >
                <td><strong>Name: </strong> <span contenteditable="true">{{ row.name }}</span></td>
                <td><strong>Fachliche Skills: </strong> <span contenteditable="true">{{ row.fachlicherSkill }}</span></td>
                <td><strong>Gehalt: </strong> <span contenteditable="true">{{ row.gehalt }}</span></td>
                <td><strong>Wohnort: </strong> <span contenteditable="true">{{ row.wohnort }}</span></td>
              </tr>
              <tr
                [class.entry-odd]="i % 2 === 1"
                [class.entry-even]="i % 2 === 0"
                class="entry-row-2"
                (dblclick)="toggleExpanded(row.kandidat)"
              >
                <td colspan="2"><strong>Vorgestellt bei: </strong> <span contenteditable="true">{{ row.vorgestelltBei }}</span></td>
                <td><strong>Gebühr: </strong> <span contenteditable="true">{{ row.gebuehr }}</span></td>
                <td><strong>Mein Anteil: </strong> <span contenteditable="true">{{ row.meinAnteil }}</span></td>
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
                      <tr *ngFor="let link of row.links">
                        <td>{{ firmaName(link.firmaId) }}</td>
                        <td>{{ sucheNach(link.suchauftragId) }}</td>
                        <td contenteditable="true" (blur)="onGebuehrenEdited(row, link, $event)">{{ link.gebuehren ?? '' }}</td>
                        <td contenteditable="true" (blur)="onMainAnteilEdited(row, link, $event)">{{ link.mainAnteil ?? '' }}</td>
                        <td>
                          <select [ngModel]="link.verknuepfungStatus ?? ''" (ngModelChange)="onStatusEdited(row, link, $event)">
                            <option value="">-</option>
                            <option *ngFor="let opt of statusOptions" [value]="opt">{{ opt }}</option>
                          </select>
                        </td>
                        <td contenteditable="true" (blur)="onKommentarEdited(row, link, $event)">{{ link.verknuepfungStatusKommentar ?? '' }}</td>
                      </tr>
                      <tr *ngIf="row.links.length === 0">
                        <td colspan="6" class="empty-links">Keine Verknüpfungen vorhanden.</td>
                      </tr>
                      <tr>
                        <td colspan="6"><button type="button" class="new-verknuepfung-btn">+ neue Verknüpfung</button></td>
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
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .wrap { display: flex; flex-direction: column; height: 100%; }
    .hint { font-size: 13px; color: #555; margin: 0; }
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
    td span[contenteditable='true'] { cursor: text; border-radius: 2px; }
    td span[contenteditable='true']:hover { background: #f8f9fd; }
    td span[contenteditable='true']:focus {
      outline: 2px solid #6a8ee0;
      outline-offset: 1px;
      background: #fff;
    }
    .entry-row-1 td { border-top: 1px solid #e5e9f3; border-bottom: none; padding-bottom: 2px; }
    .entry-row-2 td { border-top: none; border-bottom: 1px solid #d7ddec; padding-top: 2px; }
    .entry-even td { background: #fff; }
    .entry-odd td { background: #f7f8fc; }
    .entry-row-1, .entry-row-2 { cursor: pointer; }
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
    .verknuepfung-table td[contenteditable='true']:hover { background: #f8f9fd; }
    .verknuepfung-table td[contenteditable='true']:focus {
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

  private firmaNameById = new Map<string, string>();
  private sucheNachById = new Map<string, string>();
  private expandedKandidatIds = new Set<string>();

  private static readonly MONTH_FORMATTER = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

  ngOnInit(): void {
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

  toggleExpanded(kandidat: Kandidat): void {
    if (!kandidat.id) return;
    if (this.expandedKandidatIds.has(kandidat.id)) this.expandedKandidatIds.delete(kandidat.id);
    else this.expandedKandidatIds.add(kandidat.id);
  }

  isExpanded(kandidat: Kandidat): boolean {
    return !!kandidat.id && this.expandedKandidatIds.has(kandidat.id);
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
    for (const group of groups) {
      group.rows.sort((a, b) => b.sortDate - a.sortDate || a.name.localeCompare(b.name));
    }
    return groups;
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
    };
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
