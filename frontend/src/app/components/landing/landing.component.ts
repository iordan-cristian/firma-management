import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerknuepfungService } from '../../services/verknuepfung.service';
import { VerknuepfungOverview } from '../../models/verknuepfung.model';

interface KandidatGroup {
  kandidatId: string;
  kandidatName: string;
  firmenList: string;
  items: VerknuepfungOverview[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Kandidat</th>
              <th>Firmen</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let g of kandidatGroups">
              <tr class="group-row" (click)="toggleExpand(g.kandidatId)" [class.selected]="expandedKandidatId === g.kandidatId">
                <td class="chevron">{{ expandedKandidatId === g.kandidatId ? '▾' : '▸' }}</td>
                <td>{{ g.kandidatName }}</td>
                <td>{{ g.firmenList }}</td>
              </tr>
              <tr *ngIf="expandedKandidatId === g.kandidatId" class="detail-row">
                <td></td>
                <td colspan="2">
                  <table class="sub-table">
                    <thead>
                      <tr>
                        <th>Firma</th>
                        <th>Suchauftrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of g.items">
                        <td>{{ item.firmaName || '–' }}</td>
                        <td>{{ item.suchauftragAktivitaet || '–' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="!kandidatGroups.length"><td colspan="3" class="empty">Keine Verknüpfungen vorhanden.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .page-header h1 { margin: 0; color: #1f2a44; }

    .table-wrap { background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 14px; text-align: left; font-size: 14px; }
    th { background: #f1f3f8; color: #1f2a44; font-weight: 600; border-bottom: 1px solid #dfe3ee; }
    tbody tr { border-top: 1px solid #f0f1f5; }
    tbody tr:hover { background: #fafbff; }
    .empty { color: #999; text-align: center; padding: 18px; }

    .group-row { cursor: pointer; }
    tbody tr.selected { background: #eef2fb; }
    .detail-row { cursor: default; background: #f4f7ff; border-top: none; }
    .detail-row:hover { background: #f4f7ff; }
    .chevron { width: 20px; color: #7a86a8; }

    .sub-table { width: 100%; border-collapse: collapse; }
    .sub-table th, .sub-table td { padding: 8px 12px; font-size: 13px; }
    .sub-table th { background: #eaeef7; color: #4a5578; font-weight: 600; border-bottom: 1px solid #dfe3ee; }
    .sub-table tbody tr { border-top: 1px solid #e5e9f3; }
  `]
})
export class LandingComponent implements OnInit {
  private verknuepfungService = inject(VerknuepfungService);

  verknuepfungen: VerknuepfungOverview[] = [];
  kandidatGroups: KandidatGroup[] = [];
  expandedKandidatId: string | null = null;

  ngOnInit(): void {
    this.verknuepfungService.getAll().subscribe(list => {
      this.verknuepfungen = list;
      this.kandidatGroups = this.groupByKandidat(list);
    });
  }

  toggleExpand(kandidatId: string): void {
    this.expandedKandidatId = this.expandedKandidatId === kandidatId ? null : kandidatId;
  }

  private groupByKandidat(list: VerknuepfungOverview[]): KandidatGroup[] {
    const groups = new Map<string, KandidatGroup>();
    for (const v of list) {
      if (!v.kandidatId) continue;
      const name = (v.kandidatVorname || v.kandidatNachname)
        ? `${v.kandidatVorname ?? ''} ${v.kandidatNachname ?? ''}`.trim()
        : '–';
      let group = groups.get(v.kandidatId);
      if (!group) {
        group = { kandidatId: v.kandidatId, kandidatName: name, firmenList: '', items: [] };
        groups.set(v.kandidatId, group);
      }
      group.items.push(v);
    }
    for (const group of groups.values()) {
      const firmenNames = group.items.map(item => item.firmaName).filter((n): n is string => !!n);
      group.firmenList = [...new Set(firmenNames)].join(', ') || '–';
    }
    return [...groups.values()];
  }
}
