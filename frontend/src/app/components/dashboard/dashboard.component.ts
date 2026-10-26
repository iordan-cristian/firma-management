import { Component, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { KandidatSucheComponent } from '../kandidaten/kandidat-suche.component';
import { DataChangedKandidatenPermService } from '../../services/data-changed-kandidaten-perm.service';
import { Kandidat } from '../../models/kandidat.model';
import { InvestorenBestandComponent } from './tabs/investoren-bestand.component';
import { ImmobilienBestandComponent } from './tabs/immobilien-bestand.component';
import { KandidatenPermBestandComponent } from './tabs/kandidaten-perm-bestand.component';
import { KandidatenFreelancerBestandComponent } from './tabs/kandidaten-freelancer-bestand.component';
import { VertriebBestandComponent } from './tabs/vertrieb-bestand.component';
import { InvestorenSucheComponent } from './tabs/investoren-suche.component';
import { ImmobilienSucheComponent } from './tabs/immobilien-suche.component';
import { KandidatenPermSucheComponent } from './tabs/kandidaten-perm-suche.component';
import { KandidatenFreelancerSucheComponent } from './tabs/kandidaten-freelancer-suche.component';
import { VertriebSucheComponent } from './tabs/vertrieb-suche.component';

type ViewMode = 'both' | 'left' | 'right';

interface DashboardTab {
  id: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    InvestorenBestandComponent,
    ImmobilienBestandComponent,
    KandidatenPermBestandComponent,
    KandidatenFreelancerBestandComponent,
    VertriebBestandComponent,
    InvestorenSucheComponent,
    ImmobilienSucheComponent,
    KandidatenPermSucheComponent,
    KandidatenFreelancerSucheComponent,
    VertriebSucheComponent,
    KandidatSucheComponent,
  ],
  template: `
    <div class="dashboard">
      <div class="row header-row">
        <div class="col-left" *ngIf="viewMode !== 'right'">
          <h2 class="category-title">Bestand</h2>
          <div class="header-actions" *ngIf="activeLeftTabId === 'kandidaten-perm-bestand'">
            <app-kandidat-suche (results)="onKandidatSuche($event)"></app-kandidat-suche>
            <button
              type="button"
              class="header-action"
              (click)="permBestand?.openNeuerKandidat()"
            >Kandidat anlegen</button>
          </div>
        </div>
        <div class="col-middle"></div>
        <div class="col-right" *ngIf="viewMode !== 'left'">
          <h2 class="category-title">Suchaufträge</h2>
          <div class="header-actions" *ngIf="activeRightTabId === 'kandidaten-perm-suche'">
            <button
              type="button"
              class="header-action"
              (click)="permSuche?.openSuchauftragAnlegen()"
            >Suchauftrag anlegen</button>
          </div>
        </div>
      </div>

      <div class="row tabs-row">
        <div class="tab-group col-left" *ngIf="viewMode !== 'right'">
          <button
            *ngFor="let tab of leftTabs"
            type="button"
            class="tab-btn"
            [class.active]="tab.id === activeLeftTabId"
            [style.background]="tab.color"
            (click)="selectTab('left', tab.id)"
          >{{ tab.label }}</button>
        </div>

        <div class="col-middle">
          <button
            type="button"
            class="toggle-btn"
            [title]="toggleTitle"
            (click)="cycleView()"
          >{{ toggleIcon }}</button>
        </div>

        <div class="tab-group col-right" *ngIf="viewMode !== 'left'">
          <button
            *ngFor="let tab of rightTabs"
            type="button"
            class="tab-btn"
            [class.active]="tab.id === activeRightTabId"
            [style.background]="tab.color"
            (click)="selectTab('right', tab.id)"
          >{{ tab.label }}</button>
        </div>
      </div>

      <div class="row content-row">
        <div class="col-left content-col" *ngIf="viewMode !== 'right'" [ngSwitch]="activeLeftTabId">
          <app-investoren-bestand *ngSwitchCase="'investoren-bestand'"></app-investoren-bestand>
          <app-immobilien-bestand *ngSwitchCase="'immobilien-bestand'"></app-immobilien-bestand>
          <app-kandidaten-perm-bestand
            *ngSwitchCase="'kandidaten-perm-bestand'"
            [kandidatFilter]="kandidatFilter"
          ></app-kandidaten-perm-bestand>
          <app-kandidaten-freelancer-bestand *ngSwitchCase="'kandidaten-freelancer-bestand'"></app-kandidaten-freelancer-bestand>
          <app-vertrieb-bestand *ngSwitchCase="'vertrieb-bestand'"></app-vertrieb-bestand>
        </div>

        <div class="col-middle divider"></div>

        <div class="col-right content-col" *ngIf="viewMode !== 'left'" [ngSwitch]="activeRightTabId">
          <app-investoren-suche *ngSwitchCase="'investoren-suche'"></app-investoren-suche>
          <app-immobilien-suche *ngSwitchCase="'immobilien-suche'"></app-immobilien-suche>
          <app-kandidaten-perm-suche *ngSwitchCase="'kandidaten-perm-suche'"></app-kandidaten-perm-suche>
          <app-kandidaten-freelancer-suche *ngSwitchCase="'kandidaten-freelancer-suche'"></app-kandidaten-freelancer-suche>
          <app-vertrieb-suche *ngSwitchCase="'vertrieb-suche'"></app-vertrieb-suche>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
    }
    .row {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #ccc;
      background: #fff;
    }
    .header-row { min-height: 44px; }
    /* Title centered, actions on the right; the grid keeps them from overlapping */
    .header-row .col-left, .header-row .col-right {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
    }
    .header-row .category-title { grid-column: 2; }
    .header-actions {
      grid-column: 3;
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 16px 0 12px;
    }
    /* Compact search field, same height as the header buttons */
    .header-actions ::ng-deep .page-header { margin-bottom: 0; }
    .header-actions ::ng-deep .search-input { width: 220px; padding: 4px 10px; font-size: 13px; }
    .header-action {
      background: #3b5bdb;
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
    }
    .header-action:hover { background: #2f4ac7; }
    .col-left, .col-right {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .col-middle {
      flex: 0 0 44px;
      background: #d8d8d8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .category-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .tab-group {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
    }
    .tab-btn {
      flex: 1 1 0;
      min-width: 0;
      border: none;
      border-right: 1px solid rgba(0, 0, 0, 0.15);
      padding: 10px 6px;
      font-size: 13px;
      font-weight: 500;
      color: #1a1a1a;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: filter 0.15s, box-shadow 0.15s;
    }
    .tab-group .tab-btn:last-child { border-right: none; }
    .tab-btn:hover { filter: brightness(0.94); }
    .tab-btn.active {
      box-shadow: inset 0 -3px 0 #1f2a44;
      font-weight: 700;
    }
    .toggle-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #aaa;
      border-radius: 4px;
      background: #fff;
      font-size: 16px;
      line-height: 1;
      color: #333;
    }
    .toggle-btn:hover { background: #eee; }
    .content-row { flex: 1; align-items: stretch; border-bottom: none; }
    .content-col { padding: 24px 16px; min-width: 0; }
    .col-middle.divider { align-self: stretch; }
  `]
})
export class DashboardComponent {
  @ViewChild(KandidatenPermBestandComponent) permBestand?: KandidatenPermBestandComponent;
  @ViewChild(KandidatenPermSucheComponent) permSuche?: KandidatenPermSucheComponent;
  @ViewChild(KandidatSucheComponent) kandidatSuche?: KandidatSucheComponent;

  /** Ids of the Kandidaten found by the header search, passed to the Bestand; null = no search text. */
  kandidatFilter: Set<string> | null = null;

  constructor() {
    // The search loads its own Kandidaten list, so it reloads when the Kandidaten (Perm) tabs change data
    inject(DataChangedKandidatenPermService).changedByOthers(this)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.kandidatSuche?.reload());
  }

  onKandidatSuche(results: Kandidat[]): void {
    this.kandidatFilter = this.kandidatSuche?.searchText.trim()
      ? new Set(results.filter(k => !!k.id).map(k => k.id as string))
      : null;
  }

  viewMode: ViewMode = 'both';
  activeLeftTabId = 'investoren-bestand';
  activeRightTabId = 'investoren-suche';

  leftTabs: DashboardTab[] = [
    { id: 'investoren-bestand', label: 'Investoren', color: '#a6c9eb' },
    { id: 'immobilien-bestand', label: 'Immobilien', color: '#b3e5a1' },
    { id: 'kandidaten-perm-bestand', label: 'Kandidaten (Perm)', color: '#66ffff' },
    { id: 'kandidaten-freelancer-bestand', label: 'Kandidaten (Freelancer)', color: '#f6c6ac' },
    { id: 'vertrieb-bestand', label: 'Vertrieb $', color: '#e49edd' },
  ];

  rightTabs: DashboardTab[] = [
    { id: 'investoren-suche', label: 'Investoren - Suche $', color: '#a6c9eb' },
    { id: 'immobilien-suche', label: 'Immobilien - Suche $', color: '#b3e5a1' },
    { id: 'kandidaten-perm-suche', label: 'Kandidaten (Perm) - Suche $', color: '#66ffff' },
    { id: 'kandidaten-freelancer-suche', label: 'Kandidaten (Freelancer) - Suche $', color: '#f6c6ac' },
    { id: 'vertrieb-suche', label: 'Vertrieb - Suche $', color: '#e49edd' },
  ];

  selectTab(side: 'left' | 'right', id: string): void {
    if (side === 'left') {
      this.activeLeftTabId = id;
    } else {
      this.activeRightTabId = id;
    }
  }

  cycleView(): void {
    this.viewMode = this.viewMode === 'both' ? 'left' : this.viewMode === 'left' ? 'right' : 'both';
  }

  get toggleIcon(): string {
    switch (this.viewMode) {
      case 'left': return '⇐';
      case 'right': return '⇒';
      default: return '⇔';
    }
  }

  get toggleTitle(): string {
    switch (this.viewMode) {
      case 'left': return 'Zeigt Bestand – klicken für Suchaufträge';
      case 'right': return 'Zeigt Suchaufträge – klicken für Beide';
      default: return 'Zeigt Beide – klicken für Bestand';
    }
  }
}
