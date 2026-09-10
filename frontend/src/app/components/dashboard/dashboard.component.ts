import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  template: `
    <div class="dashboard">
      <div class="row header-row">
        <div class="col-left" *ngIf="viewMode !== 'right'">
          <h2 class="category-title">Bestand</h2>
        </div>
        <div class="col-middle"></div>
        <div class="col-right" *ngIf="viewMode !== 'left'">
          <h2 class="category-title">Suchaufträge</h2>
        </div>
      </div>

      <div class="row tabs-row">
        <div class="tab-group col-left" *ngIf="viewMode !== 'right'">
          <button
            *ngFor="let tab of leftTabs"
            type="button"
            class="tab-btn"
            [class.active]="tab.id === activeTabId"
            [style.background]="tab.color"
            (click)="selectTab(tab.id)"
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
            [class.active]="tab.id === activeTabId"
            [style.background]="tab.color"
            (click)="selectTab(tab.id)"
          >{{ tab.label }}</button>
        </div>
      </div>

      <div class="content" [ngSwitch]="activeTabId">
        <app-investoren-bestand *ngSwitchCase="'investoren-bestand'"></app-investoren-bestand>
        <app-immobilien-bestand *ngSwitchCase="'immobilien-bestand'"></app-immobilien-bestand>
        <app-kandidaten-perm-bestand *ngSwitchCase="'kandidaten-perm-bestand'"></app-kandidaten-perm-bestand>
        <app-kandidaten-freelancer-bestand *ngSwitchCase="'kandidaten-freelancer-bestand'"></app-kandidaten-freelancer-bestand>
        <app-vertrieb-bestand *ngSwitchCase="'vertrieb-bestand'"></app-vertrieb-bestand>
        <app-investoren-suche *ngSwitchCase="'investoren-suche'"></app-investoren-suche>
        <app-immobilien-suche *ngSwitchCase="'immobilien-suche'"></app-immobilien-suche>
        <app-kandidaten-perm-suche *ngSwitchCase="'kandidaten-perm-suche'"></app-kandidaten-perm-suche>
        <app-kandidaten-freelancer-suche *ngSwitchCase="'kandidaten-freelancer-suche'"></app-kandidaten-freelancer-suche>
        <app-vertrieb-suche *ngSwitchCase="'vertrieb-suche'"></app-vertrieb-suche>
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
    .content { padding: 24px 0; flex: 1; }
  `]
})
export class DashboardComponent {
  viewMode: ViewMode = 'both';
  activeTabId = 'investoren-bestand';

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

  selectTab(id: string): void {
    this.activeTabId = id;
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
