import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchKandidatResult } from '../../services/match-kandidat.service';
import { Kandidat, Geschlecht } from '../../models/kandidat.model';

/**
 * Side panel listing the Kandidaten matched for a Suchauftrag, incl. score explanation
 * and a right-click menu to create a Verknüpfung.
 */
@Component({
  selector: 'app-matched-kandidaten-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal modal-match">
      <div class="match-header">
        <h2>Matched Kandidaten</h2>
        <button class="close" (click)="close.emit()">✕</button>
      </div>
      <p class="hint" *ngIf="results.length" [title]="kriterienExplained">{{ kriterienExplained }}</p>
      <div *ngIf="!results.length" class="empty">Keine Treffer gefunden.</div>
      <div class="match-list">
        <div class="match-card" *ngFor="let r of results"
             (dblclick)="kandidatOpened.emit(r.kandidat)"
             (contextmenu)="openMenu($event, r.kandidat)"
             [class.match-card-selected]="selectedKandidatId === r.kandidat.id">
          <div class="card-title">
            {{ anrede(r.kandidat.geschlecht) }} {{ r.kandidat.titel }} {{ r.kandidat.vorname }} {{ r.kandidat.nachname }}
            <span class="match-score">{{ r.score }} / {{ maxScore }}</span>
          </div>
          <div class="card-divider">Score Erklärung</div>
          <div class="card-row card-row-success" *ngIf="r.satisfiedKriterien"><span>Erfüllt:</span> {{ r.satisfiedKriterien }}</div>
          <div class="card-row card-row-danger" *ngIf="r.unsatisfiedKriterien"><span>Nicht erfüllt:</span> {{ r.unsatisfiedKriterien }}</div>
          <div class="card-divider">Kandidatendaten</div>
          <div class="card-row" *ngIf="r.kandidat.allgemeinerSchwerpunkt"><span>Schwerpunkt:</span> {{ r.kandidat.allgemeinerSchwerpunkt }}</div>
          <div class="card-row" *ngIf="r.kandidat.ort"><span>Ort:</span> {{ r.kandidat.ort }}</div>
          <div class="card-row" *ngIf="r.kandidat.fachlicherSkill"><span>Fachlicher Skill:</span> {{ r.kandidat.fachlicherSkill }}</div>
          <div class="card-row" *ngIf="gehaltDisplay(r.kandidat.gehaltMinimum, r.kandidat.gehaltMaximum) as g"><span>Gehalt:</span> {{ g }} <span>Tausend €</span> </div>
          <div class="card-row" *ngIf="r.kandidat.berufserfahrung"><span>Berufserfahrung:</span> {{ r.kandidat.berufserfahrung }}</div>
          <div class="card-row" *ngIf="r.kandidat.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ r.kandidat.branchenkenntnisse }}</div>
          <div class="card-row" *ngIf="r.kandidat.zertifikate"><span>Zertifikate:</span> {{ r.kandidat.zertifikate }}</div>
        </div>
      </div>
    </div>

    <!-- Match Kandidat context menu -->
    <div class="ctx-menu"
         *ngIf="menuKandidat"
         [style.top.px]="menuY"
         [style.left.px]="menuX"
         (click)="$event.stopPropagation()">
      <button (click)="onVerknuepfung()">Verknüpfung</button>
    </div>
  `,
  styles: [`
    /* The panel sits as a flex item next to the Suchauftrag modal (see .modal-duo in the dialog) */
    :host { display: contents; }
    .modal {
      background: white; border-radius: 10px; padding: 28px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal-match { width: 400px; flex-shrink: 0; display: flex; flex-direction: column; }
    .match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .match-header h2 { margin: 0; color: #1f2a44; font-size: 18px; }
    .close { background: transparent; border: 1px solid #dfe3ee; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .hint { color: #777; margin: 0 0 16px; font-size: 13px; white-space: pre-line; }
    .empty { color: #999; text-align: center; padding: 18px; }
    .match-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; }
    .match-card { background: #f8f9ff; border: 1px solid #e5e9f3; border-radius: 8px; padding: 12px; cursor: pointer; }
    .match-card:hover { border-color: #3b5bdb; }
    .match-card-selected { border-color: #3b5bdb; background: #eef2fb; }
    .card-title { font-weight: 600; margin-bottom: 8px; color: #1f2a44; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .match-score { font-size: 12px; font-weight: 700; color: #3b5bdb; background: #eef1fb; border-radius: 10px; padding: 2px 8px; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .card-row-success, .card-row-success span:first-child { color: #1e7d32; }
    .card-row-danger, .card-row-danger span:first-child { color: #c92a2a; }
    .card-row-success, .card-row-danger { white-space: pre-line; }

    .ctx-menu {
      position: fixed; background: white; border: 1px solid #dfe3ee; border-radius: 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      min-width: 180px; z-index: 2100; overflow: hidden;
    }
    .ctx-menu button { background: white; border: none; text-align: left; padding: 10px 14px; font-size: 14px; cursor: pointer; }
    .ctx-menu button:hover { background: #eef2fb; }
  `]
})
export class MatchedKandidatenPanelComponent {
  @Input() results: MatchKandidatResult[] = [];
  @Input() kriterienExplained = '';
  @Input() maxScore = 0;
  /** Kandidat currently shown in the detail panel; its card is highlighted. */
  @Input() selectedKandidatId?: string;
  /** Double-click on a card: show the Kandidat in the detail panel. */
  @Output() kandidatOpened = new EventEmitter<Kandidat>();
  /** "Verknüpfung" chosen in the right-click menu of a card. */
  @Output() verknuepfung = new EventEmitter<Kandidat>();
  @Output() close = new EventEmitter<void>();

  /** Kandidat whose right-click menu is open. */
  menuKandidat: Kandidat | null = null;
  menuX = 0;
  menuY = 0;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuKandidat = null;
  }

  openMenu(event: MouseEvent, kandidat: Kandidat): void {
    event.preventDefault();
    this.menuKandidat = kandidat;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
  }

  onVerknuepfung(): void {
    const kandidat = this.menuKandidat;
    this.menuKandidat = null;
    if (kandidat) this.verknuepfung.emit(kandidat);
  }

  anrede(geschlecht?: Geschlecht): string {
    if (geschlecht === 'männlich') return 'Herr';
    if (geschlecht === 'weiblich') return 'Frau';
    return '';
  }

  gehaltDisplay(min?: number, max?: number): string | null {
    if (min != null && max != null) return `${min}-${max}`;
    if (min != null) return `${min}`;
    if (max != null) return `${max}`;
    return null;
  }
}
