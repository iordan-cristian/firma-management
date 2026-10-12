import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuchauftragService } from '../../../services/suchauftrag.service';
import { VerknuepfungService } from '../../../services/verknuepfung.service';
import { Suchauftrag, SuchauftragUebersicht, SuchauftragUebersichtKandidat } from '../../../models/suchauftrag.model';
import { Geschlecht, Kandidat, Titel } from '../../../models/kandidat.model';
import { VERKNUEPFUNG_STATUS_COLORS, VERKNUEPFUNG_STATUS_OPTIONS, VERKNUEPFUNG_STATUS_ORDER, VerknuepfungStatus } from '../../../models/verknuepfung-status.model';
import { Firma } from '../../../models/firma.model';
import { SuchauftragDialogComponent } from '../../suchauftraege/suchauftrag-dialog.component';
import { KandidatDialogComponent } from '../../kandidaten/kandidat-dialog.component';
import { KandidatService } from '../../../services/kandidat.service';
import { FirmaService } from '../../../services/firma.service';
import { AnsprechpartnerService } from '../../../services/ansprechpartner.service';
import { Ansprechpartner } from '../../../models/ansprechpartner.model';
import { NeueFirmaDialogComponent } from '../../firmen/neue-firma-dialog.component';
import { AnsprechpartnerDialogComponent } from '../../Ansprechpartner/ansprechpartner-dialog.component';
import { ChoseFirmaAndAnsprechpartnerForSuchauftragComponent } from '../../suchauftraege/chose-firma-and-ansprechpartner-for-suchauftrag.component';

interface SuchauftragRow {
  suchauftrag: Suchauftrag;
  firmaId?: string;
  firma: string;
  ansprechpartner: string;
  sucheNach: string;
  gehalt: string;
  kandidaten: string;
  koFaktoren: string;
  standort: string;
  links: SuchauftragUebersichtKandidat[];
  sortDate: number;
  highestStatus: number;
  highestStatusName?: VerknuepfungStatus;
}

interface MonthGroup {
  key: number;
  label: string;
  rows: SuchauftragRow[];
}

/** Label + value getter for every Suchauftrag field that can be flagged as K.O.-Kriterium. */
const KO_FAKTOREN: { label: string; isKo: (s: Suchauftrag) => boolean | undefined; value: (s: Suchauftrag) => unknown }[] = [
  { label: 'Allgemeiner Schwerpunkt', isKo: s => s.allgemeinerSchwerpunktKOKriterium, value: s => s.allgemeinerSchwerpunkt?.replace(/_/g, ' ') },
  { label: 'Fachlicher Skill', isKo: s => s.fachlicherSkillKOKriterium, value: s => s.fachlicherSkill?.replace(/_/g, ' ') },
  { label: 'Gehalt', isKo: s => s.gehaltKOKriterium, value: s => formatGehalt(s) ?? s.gehalt },
  { label: 'Berufserfahrung', isKo: s => s.berufserfahrungKOKriterium, value: s => s.berufserfahrung != null ? `${s.berufserfahrung} Jahre` : undefined },
  { label: 'Branchenkenntnisse', isKo: s => s.branchenkenntnisseKOKriterium, value: s => s.branchenkenntnisse },
  { label: 'Zertifikate', isKo: s => s.zertifikateKOKriterium, value: s => s.zertifikate },
  { label: 'Deutsch', isKo: s => s.deutschKOKriterium, value: s => s.deutsch },
  { label: 'Englisch', isKo: s => s.englischKOKriterium, value: s => s.englisch },
  { label: 'Sonstige Sprachen', isKo: s => s.sonstigeSprachenKOKriterium, value: s => s.sonstigeSprachen },
];

function formatGehalt(s: Suchauftrag): string | undefined {
  const min = s.gehaltMinimum;
  const max = s.gehaltMaximum;
  if (min != null && max != null) return `${min}-${max} (Tausend €)`;
  if (min != null) return `${min} (Tausend €)`;
  if (max != null) return `${max} (Tausend €)`;
  return undefined;
}

@Component({
  selector: 'app-kandidaten-perm-suche',
  standalone: true,
  imports: [CommonModule, FormsModule, SuchauftragDialogComponent, KandidatDialogComponent, NeueFirmaDialogComponent, AnsprechpartnerDialogComponent, ChoseFirmaAndAnsprechpartnerForSuchauftragComponent],
  host: { '(document:click)': 'closeMenu()' },
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
                [class.status-colored]="!!row.highestStatusName"
                [style]="statusStyle(row.highestStatusName)"
                (dblclick)="toggleExpanded(row.suchauftrag)"
                (contextmenu)="openRowMenu($event, row)"
              >
                <td><strong>Firma: </strong> {{ row.firma }}</td>
                <td><strong>Ansprechpartner: </strong> {{ row.ansprechpartner }}</td>
                <td><strong>Suche nach: </strong> {{ row.sucheNach }}</td>
                <td><strong>Gehalt: </strong> {{ row.gehalt }}</td>
              </tr>
              <tr
                [class.entry-odd]="i % 2 === 1"
                [class.entry-even]="i % 2 === 0"
                class="entry-row-2"
                [class.status-colored]="!!row.highestStatusName"
                [style]="statusStyle(row.highestStatusName)"
                (dblclick)="toggleExpanded(row.suchauftrag)"
                (contextmenu)="openRowMenu($event, row)"
              >
                <td><strong>Kandidaten: </strong> {{ row.kandidaten }}</td>
                <td colspan="2"><strong>K.O.-Faktoren: </strong> {{ row.koFaktoren }}</td>
                <td><strong>Standort: </strong> {{ row.standort }}</td>
              </tr>
              <tr class="detail-row" *ngIf="isExpanded(row.suchauftrag)">
                <td colspan="4">
                  <table class="verknuepfung-table">
                    <colgroup>
                      <col style="width: 24%;" />
                      <col style="width: 10%;" />
                      <col style="width: 10%;" />
                      <col style="width: 14%;" />
                      <col style="width: 42%;" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Kandidat</th>
                        <th>Gebühren</th>
                        <th>Mein Anteil</th>
                        <th>Status</th>
                        <th>Kommentar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        *ngFor="let k of row.links"
                        [class.status-colored]="!!k.verknuepfung.verknuepfungStatus"
                        [style]="statusStyle(k.verknuepfung.verknuepfungStatus)"
                        (contextmenu)="openMenu($event, k)"
                      >
                        <td>{{ kandidatName(k) }}</td>
                        <td contenteditable="true" [textContent]="k.verknuepfung.gebuehren ?? ''" (blur)="onGebuehrenEdited(k, $event)"></td>
                        <td contenteditable="true" [textContent]="k.verknuepfung.mainAnteil ?? ''" (blur)="onMainAnteilEdited(k, $event)"></td>
                        <td>
                          <select [ngModel]="k.verknuepfung.verknuepfungStatus ?? ''" (ngModelChange)="onStatusEdited(row, k, $event)">
                            <option value="">-</option>
                            <option *ngFor="let opt of statusOptions" [value]="opt">{{ opt }}</option>
                          </select>
                        </td>
                        <td contenteditable="true" [textContent]="k.verknuepfung.verknuepfungStatusKommentar ?? ''" (blur)="onKommentarEdited(k, $event)"></td>
                      </tr>
                      <tr *ngIf="row.links.length === 0">
                        <td colspan="5" class="empty-links">Keine Verknüpfungen vorhanden.</td>
                      </tr>
                      <tr>
                        <td colspan="5"><button type="button" class="new-verknuepfung-btn" (click)="openNeueVerknuepfung(row)">+ neue Verknüpfung</button></td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="save-error" *ngIf="saveError">{{ saveError }}</p>
                </td>
              </tr>
            </ng-container>
          </ng-container>
          <tr *ngIf="groups.length === 0">
            <td colspan="4" class="empty">Keine Suchaufträge vorhanden.</td>
          </tr>
        </tbody>
      </table>

      <app-suchauftrag-dialog
        *ngIf="dialogSuchauftragRow && dialogFirma"
        [firma]="dialogFirma"
        [suchauftrag]="dialogSuchauftragRow.suchauftrag"
        [autoMatch]="dialogAutoMatch"
        (saved)="dialogChanged = true"
        (verknuepfungenChanged)="dialogChanged = true"
        (close)="closeSuchauftragDialog()"
      ></app-suchauftrag-dialog>

      <!-- Custom right-click context menus -->
      <div class="ctx-menu"
           *ngIf="menuRow"
           [style.top.px]="menuY"
           [style.left.px]="menuX"
           (click)="$event.stopPropagation()">
        <button (click)="openSuchauftragDialog()">Suchauftrag anzeigen</button>
        <button (click)="openAnsprechpartnerDialog()">Ansprechpartner anzeigen</button>
        <button (click)="openFirmaDialog()">Firma anzeigen</button>
      </div>

      <div class="ctx-menu"
           *ngIf="menuKandidat"
           [style.top.px]="menuY"
           [style.left.px]="menuX"
           (click)="$event.stopPropagation()">
        <button (click)="openKandidatDialog()">Kandidat anzeigen</button>
      </div>

      <app-ansprechpartner-dialog
        *ngIf="dialogAnsprechpartner"
        [ansprechpartner]="dialogAnsprechpartner"
        (saved)="onStammdatenSaved()"
        (close)="dialogAnsprechpartner = null"
      ></app-ansprechpartner-dialog>

      <app-neue-firma-dialog
        *ngIf="dialogStammFirma"
        [firma]="dialogStammFirma"
        (saved)="onStammdatenSaved()"
        (close)="dialogStammFirma = null"
      ></app-neue-firma-dialog>

      <app-kandidat-dialog
        *ngIf="dialogKandidat"
        [kandidat]="dialogKandidat"
        (saved)="onKandidatSaved()"
        (changed)="load()"
        (close)="closeKandidatDialog()"
      ></app-kandidat-dialog>

      <app-chose-firma-and-ansprechpartner-for-suchauftrag
        *ngIf="suchauftragAnlegenOpen"
        (saved)="dialogChanged = true"
        (close)="onSuchauftragAnlegenClosed()"
      ></app-chose-firma-and-ansprechpartner-for-suchauftrag>
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
export class KandidatenPermSucheComponent implements OnInit {
  private suchauftragService = inject(SuchauftragService);
  private verknuepfungService = inject(VerknuepfungService);
  private kandidatService = inject(KandidatService);
  private firmaService = inject(FirmaService);
  private ansprechpartnerService = inject(AnsprechpartnerService);

  loading = true;
  groups: MonthGroup[] = [];
  statusOptions = VERKNUEPFUNG_STATUS_OPTIONS;
  saveError: string | null = null;
  /** Row whose Suchauftrag is shown in the Suchauftrag dialog. */
  dialogSuchauftragRow: SuchauftragRow | null = null;
  /** Whether the Suchauftrag dialog opens with the matched Kandidaten (used for "+ neue Verknüpfung"). */
  dialogAutoMatch = false;
  /** Set when the Suchauftrag dialog stored something; the overview is reloaded on close. */
  dialogChanged = false;
  /** Firma of the Suchauftrag shown in the dialog. */
  dialogFirma: Firma | null = null;
  /** Suchauftrag row whose right-click menu is open. */
  menuRow: SuchauftragRow | null = null;
  /** Linked Kandidat whose right-click menu is open. */
  menuKandidat: SuchauftragUebersichtKandidat | null = null;
  menuX = 0;
  menuY = 0;
  /** Kandidat shown in the Kandidat dialog. */
  dialogKandidat: Kandidat | null = null;
  /** Ansprechpartner shown in the Ansprechpartner dialog. */
  dialogAnsprechpartner: Ansprechpartner | null = null;
  /** Firma shown in the Firma dialog (dialogFirma is only the reference passed to the Suchauftrag dialog). */
  dialogStammFirma: Firma | null = null;
  /** Whether the "Suchauftrag anlegen" mask (Firma + Ansprechpartner selection) is open. */
  suchauftragAnlegenOpen = false;

  private expandedSuchauftragIds = new Set<string>();

  private static readonly MONTH_FORMATTER = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.suchauftragService.getUebersicht().subscribe(items => {
      this.groups = this.buildGroups(items);
      this.loading = false;
    });
  }

  toggleExpanded(suchauftrag: Suchauftrag): void {
    if (!suchauftrag.id) return;
    const wasExpanded = this.expandedSuchauftragIds.has(suchauftrag.id);
    // Only one row can be expanded at a time
    this.expandedSuchauftragIds.clear();
    if (!wasExpanded) this.expandedSuchauftragIds.add(suchauftrag.id);
  }

  isExpanded(suchauftrag: Suchauftrag): boolean {
    return !!suchauftrag.id && this.expandedSuchauftragIds.has(suchauftrag.id);
  }

  /** Opens the Suchauftrag with the matched Kandidaten; Verknüpfungen are added via right-click on a Kandidat. */
  openNeueVerknuepfung(row: SuchauftragRow): void {
    this.showSuchauftrag(row, true);
  }

  private showSuchauftrag(row: SuchauftragRow, autoMatch: boolean): void {
    this.dialogChanged = false;
    this.dialogAutoMatch = autoMatch;
    this.dialogFirma = { id: row.firmaId, name: row.firma };
    this.dialogSuchauftragRow = row;
  }

  openSuchauftragAnlegen(): void {
    this.dialogChanged = false;
    this.suchauftragAnlegenOpen = true;
  }

  onSuchauftragAnlegenClosed(): void {
    this.suchauftragAnlegenOpen = false;
    if (this.dialogChanged) this.load();
  }

  closeSuchauftragDialog(): void {
    this.dialogSuchauftragRow = null;
    this.dialogFirma = null;
    if (this.dialogChanged) this.load();
  }

  openRowMenu(event: MouseEvent, row: SuchauftragRow): void {
    event.preventDefault();
    this.menuKandidat = null;
    this.menuRow = row;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
  }

  openMenu(event: MouseEvent, k: SuchauftragUebersichtKandidat): void {
    event.preventDefault();
    this.menuRow = null;
    this.menuKandidat = k;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
  }

  closeMenu(): void {
    this.menuRow = null;
    this.menuKandidat = null;
  }

  openSuchauftragDialog(): void {
    const row = this.menuRow;
    this.closeMenu();
    if (row) this.showSuchauftrag(row, false);
  }

  openAnsprechpartnerDialog(): void {
    const ansprechpartnerId = this.menuRow?.suchauftrag.ansprechpartnerId;
    this.closeMenu();
    if (!ansprechpartnerId) return;
    this.ansprechpartnerService.getById(ansprechpartnerId).subscribe(a => this.dialogAnsprechpartner = a);
  }

  openFirmaDialog(): void {
    const firmaId = this.menuRow?.firmaId;
    this.closeMenu();
    if (!firmaId) return;
    this.firmaService.getById(firmaId).subscribe(f => this.dialogStammFirma = f);
  }

  /** Firma or Ansprechpartner names are shown in the overview, so it is reloaded after saving. */
  onStammdatenSaved(): void {
    this.dialogAnsprechpartner = null;
    this.dialogStammFirma = null;
    this.load();
  }

  /** The overview only carries the name, so the full Kandidat is loaded before opening the dialog. */
  openKandidatDialog(): void {
    const kandidatId = this.menuKandidat?.kandidatId;
    this.closeMenu();
    if (!kandidatId) return;
    this.kandidatService.getById(kandidatId).subscribe(kandidat => this.dialogKandidat = kandidat);
  }

  closeKandidatDialog(): void {
    this.dialogKandidat = null;
  }

  onKandidatSaved(): void {
    this.closeKandidatDialog();
    this.load();
  }

  kandidatName(k: SuchauftragUebersichtKandidat): string {
    return this.formatName(k.geschlecht, k.titel, k.vorname, k.nachname);
  }

  onGebuehrenEdited(k: SuchauftragUebersichtKandidat, event: Event): void {
    k.verknuepfung.gebuehren = this.parseEditedNumber(event);
    this.saveLink(k);
  }

  onMainAnteilEdited(k: SuchauftragUebersichtKandidat, event: Event): void {
    k.verknuepfung.mainAnteil = this.parseEditedNumber(event);
    this.saveLink(k);
  }

  onKommentarEdited(k: SuchauftragUebersichtKandidat, event: Event): void {
    const text = (event.target as HTMLElement).innerText.trim();
    k.verknuepfung.verknuepfungStatusKommentar = text || undefined;
    this.saveLink(k);
  }

  onStatusEdited(row: SuchauftragRow, k: SuchauftragUebersichtKandidat, value: string): void {
    k.verknuepfung.verknuepfungStatus = value || undefined;
    Object.assign(row, this.findHighestStatus(row.links));
    const group = this.groups.find(g => g.rows.includes(row));
    if (group) this.sortRows(group);
    this.saveLink(k);
  }

  private parseEditedNumber(event: Event): number | undefined {
    const text = (event.target as HTMLElement).innerText.trim().replace(',', '.');
    if (!text) return undefined;
    const value = Number(text);
    return Number.isNaN(value) ? undefined : value;
  }

  private saveLink(k: SuchauftragUebersichtKandidat): void {
    const link = k.verknuepfung;
    if (!link.id) return;
    this.saveError = null;
    this.verknuepfungService.update(link.id, link).subscribe({
      next: updated => Object.assign(link, updated),
      error: () => { this.saveError = 'Speichern fehlgeschlagen.'; },
    });
  }

  private buildGroups(items: SuchauftragUebersicht[]): MonthGroup[] {
    const groupsByKey = new Map<number, MonthGroup>();

    for (const item of items) {
      const date = this.parseDate(item.suchauftrag.anlageDatum);
      const key = date ? date.getFullYear() * 12 + date.getMonth() : Number.NEGATIVE_INFINITY;
      const label = date ? KandidatenPermSucheComponent.MONTH_FORMATTER.format(date) : 'Ohne Anlagedatum';

      let group = groupsByKey.get(key);
      if (!group) {
        group = { key, label, rows: [] };
        groupsByKey.set(key, group);
      }

      group.rows.push(this.buildRow(item, date));
    }

    const groups = Array.from(groupsByKey.values()).sort((a, b) => b.key - a.key);
    groups.forEach(group => this.sortRows(group));
    return groups;
  }

  /** Lowest highest-status first, then newest Anlagedatum, then Suche nach. */
  private sortRows(group: MonthGroup): void {
    group.rows.sort((a, b) =>
      a.highestStatus - b.highestStatus || b.sortDate - a.sortDate || a.sucheNach.localeCompare(b.sucheNach));
  }

  private buildRow(item: SuchauftragUebersicht, date: Date | null): SuchauftragRow {
    const s = item.suchauftrag;
    return {
      suchauftrag: s,
      firmaId: item.firmaId,
      firma: item.firmaName?.trim() || '-',
      ansprechpartner: this.formatName(item.ansprechpartnerGeschlecht, item.ansprechpartnerTitel,
        item.ansprechpartnerVorname, item.ansprechpartnerNachname),
      sucheNach: s.sucheNach?.trim() || '-',
      gehalt: formatGehalt(s) ?? '-',
      kandidaten: this.formatKandidaten(item.kandidaten),
      koFaktoren: this.formatKoFaktoren(s),
      standort: s.ort?.trim() || '-',
      links: item.kandidaten,
      sortDate: date ? date.getTime() : Number.NEGATIVE_INFINITY,
      ...this.findHighestStatus(item.kandidaten),
    };
  }

  /** Highest status among the linked Kandidaten; order 0 when none has a status. */
  private findHighestStatus(kandidaten: SuchauftragUebersichtKandidat[]): { highestStatus: number; highestStatusName?: VerknuepfungStatus } {
    let result: { highestStatus: number; highestStatusName?: VerknuepfungStatus } = { highestStatus: 0 };
    for (const k of kandidaten) {
      const name = k.verknuepfung.verknuepfungStatus as VerknuepfungStatus;
      const order = VERKNUEPFUNG_STATUS_ORDER[name];
      if (order != null && order > result.highestStatus) result = { highestStatus: order, highestStatusName: name };
    }
    return result;
  }

  statusStyle(status?: string): Record<string, string> | null {
    const colors = status ? VERKNUEPFUNG_STATUS_COLORS[status as VerknuepfungStatus] : undefined;
    return colors ? { '--status-bg': colors.background, '--status-fg': colors.color } : null;
  }

  private formatName(geschlecht?: Geschlecht, titel?: Titel, vorname?: string, nachname?: string): string {
    const anrede = geschlecht === 'männlich' ? 'Herr' : geschlecht === 'weiblich' ? 'Frau' : '';
    return [anrede, titel, vorname, nachname].filter(Boolean).join(' ') || '-';
  }

  private formatKandidaten(kandidaten: SuchauftragUebersichtKandidat[]): string {
    return kandidaten.map(k => this.formatName(k.geschlecht, k.titel, k.vorname, k.nachname)).join(', ') || '-';
  }

  private formatKoFaktoren(s: Suchauftrag): string {
    const parts = KO_FAKTOREN
      .filter(f => f.isKo(s))
      .map(f => {
        const value = f.value(s);
        const text = value == null ? '' : String(value).trim();
        return text ? `${f.label}: ${text}` : f.label;
      });
    return parts.length ? parts.join(', ') : '-';
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    // Backend serializes anlageDatum as "dd/MM/yyyy" (see Suchauftrag.java @JsonFormat).
    const [d, m, y] = value.split('/').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
}
