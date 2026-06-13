import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuchauftragService } from '../../services/suchauftrag.service';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { Suchauftrag, AKTIVITAET_OPTIONS, STATUS_OPTIONS } from '../../models/suchauftrag.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';

@Component({
  selector: 'app-suchauftraege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Suchaufträge</h1>
        <div class="header-right">
          <label class="toggle">
            <input type="checkbox" [(ngModel)]="showAll" (change)="reload()" />
            <span>Show all (regardless of status)</span>
          </label>
          <button class="btn-add" (click)="openAddModal()">+ Suchauftrag</button>
        </div>
      </header>

      <p class="hint">
        {{ showAll ? 'All Suchaufträge' : 'Showing only Suchaufträge with status "in Arbeit"' }}
      </p>

      <div class="cards">
        <div class="card" *ngFor="let s of items" (dblclick)="openEditModal(s)">
          <div class="card-title">{{ s.aktivitaet }}</div>
          <div class="card-row"><span>Status:</span>
            <span class="badge" [class.done]="s.status === 'Fertig'">{{ s.status }}</span>
          </div>
          <div class="card-row" *ngIf="s.ort"><span>Ort:</span> {{ s.ort }}</div>
          <div class="card-row" *ngIf="s.fachlicherSkill"><span>Fachlicher Skill:</span> {{ s.fachlicherSkill }}</div>
          <div class="card-row" *ngIf="s.gehalt"><span>Gehalt:</span> {{ s.gehalt }}</div>
          <div class="card-row" *ngIf="s.berufserfahrung"><span>Berufserfahrung:</span> {{ s.berufserfahrung }}</div>
          <div class="card-row" *ngIf="s.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ s.branchenkenntnisse }}</div>
          <div class="card-row" *ngIf="s.zertifikate"><span>Zertifikate:</span> {{ s.zertifikate }}</div>
          <div class="card-row"><span>Ansprechpartner:</span> {{ apName(s.ansprechpartnerId) }}</div>
        </div>
        <div *ngIf="!items.length" class="empty">Nothing to show.</div>
      </div>

      <!-- Add Suchauftrag Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen" (click)="closeAddModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingId ? 'Suchauftrag bearbeiten' : 'Neuer Suchauftrag' }}</h2>
          <label>Ansprechpartner *
            <select [(ngModel)]="draft.ansprechpartnerId">
              <option value="" disabled>— auswählen —</option>
              <option *ngFor="let a of apList" [value]="a.id">{{ a.vorname }} {{ a.nachname }}</option>
            </select>
          </label>
          <label>Aktivität *
            <select [(ngModel)]="draft.aktivitaet">
              <option *ngFor="let k of aktivitaetOptions" [value]="k">{{ k }}</option>
            </select>
          </label>
          <label>Ort
            <input [(ngModel)]="draft.ort" placeholder="Ort" />
          </label>
          <label>Fachlicher Skill
            <input [(ngModel)]="draft.fachlicherSkill" placeholder="z.B. Java, SAP, CAD" />
          </label>
          <label>Gehalt
            <input [(ngModel)]="draft.gehalt" placeholder="z.B. 60000-80000" />
          </label>
          <label>Berufserfahrung
            <input [(ngModel)]="draft.berufserfahrung" placeholder="z.B. 5+ Jahre" />
          </label>
          <label>Branchenkenntnisse
            <input [(ngModel)]="draft.branchenkenntnisse" placeholder="z.B. Automotive, IT" />
          </label>
          <label>Zertifikate
            <input [(ngModel)]="draft.zertifikate" placeholder="z.B. PMP, ISO 9001" />
          </label>
          <label>Status *
            <select [(ngModel)]="draft.status">
              <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
            </select>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveSuchauftrag()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    h1 { margin: 0; color: #1f2a44; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }
    .toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #333; cursor: pointer; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .btn-add:hover { background: #2f4ac7; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid #e5e9f3; border-radius: 8px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); cursor: pointer; }
    .card:hover { border-color: #3b5bdb; }
    .card-title { font-weight: 600; color: #1f2a44; margin-bottom: 8px; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 12px; }
    .badge.done { background: #b6e3b6; }
    .empty { color: #999; padding: 24px; text-align: center; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 400px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .modal input, .modal select { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; }
    .modal input:focus, .modal select:focus { outline: none; border-color: #3b5bdb; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }

  `]
})
export class SuchauftraegeComponent implements OnInit {
  private service = inject(SuchauftragService);
  private apService = inject(AnsprechpartnerService);

  items: Suchauftrag[] = [];
  showAll = false;
  apNames = new Map<string, string>();
  apList: Ansprechpartner[] = [];

  readonly aktivitaetOptions = AKTIVITAET_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  addModalOpen = false;
  editingId: string | null = null;
  draft: Partial<Suchauftrag> = {};

  ngOnInit(): void {
    this.apService.getAll().subscribe(list => {
      this.apList = list;
      list.forEach(a => {
        if (a.id) this.apNames.set(a.id, [a.vorname, a.nachname].filter(Boolean).join(' '));
      });
      this.reload();
    });
  }

  apName(id: string): string {
    return this.apNames.get(id) ?? '–';
  }

  reload(): void {
    if (this.showAll) {
      this.service.getAll().subscribe(list => (this.items = list));
    } else {
      this.service.getAll('in Arbeit').subscribe(list => (this.items = list));
    }
  }

  openAddModal(): void {
    this.editingId = null;
    this.draft = { aktivitaet: 'Investoren', status: 'in Arbeit' };
    this.addModalOpen = true;
  }

  openEditModal(s: Suchauftrag): void {
    this.editingId = s.id ?? null;
    this.draft = { ...s };
    this.addModalOpen = true;
  }

  closeAddModal(): void { this.addModalOpen = false; }

  saveSuchauftrag(): void {
    if (!this.draft.ansprechpartnerId || !this.draft.aktivitaet || !this.draft.status) return;
    if (this.editingId) {
      this.service.update(this.editingId, this.draft as Suchauftrag).subscribe(() => {
        this.reload();
        this.closeAddModal();
      });
    } else {
      this.service.create(this.draft as Suchauftrag).subscribe(() => {
        this.reload();
        this.closeAddModal();
      });
    }
  }
}