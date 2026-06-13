import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VertragService } from '../../services/vertrag.service';
import { FirmaService } from '../../services/firma.service';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { Vertrag } from '../../models/vertrag.model';

@Component({
  selector: 'app-vertraege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Verträge</h1>
        <button class="btn-add" (click)="openAddModal()">+ Vertrag</button>
      </div>
      <p class="hint">Sorted by bezahlbarAm (ascending).</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bezahlbar am</th>
              <th>Wert</th>
              <th>Bezahlt</th>
              <th>Firma</th>
              <th>Ansprechpartner</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let v of items" (dblclick)="openEditModal(v)" style="cursor:pointer">
              <td>{{ v.bezahlbarAm }}</td>
              <td>{{ v.wert | number:'1.2-2' }} €</td>
              <td>
                <span class="badge" [class.done]="v.bezahlt">{{ v.bezahlt ? 'Ja' : 'Nein' }}</span>
              </td>
              <td>{{ firmaName(v.firmaId) }}</td>
              <td>{{ apName(v.ansprechpartnerId) }}</td>
            </tr>
            <tr *ngIf="!items.length"><td colspan="5" class="empty">No Verträge yet.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Add Vertrag Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen">
        <div class="modal">
          <h2>{{ editingId ? 'Vertrag bearbeiten' : 'Neuer Vertrag' }}</h2>
          <label>Ansprechpartner ID *
            <input [(ngModel)]="draft.ansprechpartnerId" placeholder="UUID" />
          </label>
          <label>Firma ID *
            <input [(ngModel)]="draft.firmaId" placeholder="UUID" />
          </label>
          <label>Suchauftrag ID
            <input [(ngModel)]="draft.suchauftragId" placeholder="UUID (optional)" />
          </label>
          <label>Wert (€)
            <input type="number" [(ngModel)]="draft.wert" placeholder="0.00" step="0.01" />
          </label>
          <label>Bezahlbar am
            <input type="date" [(ngModel)]="bezahlbarAmInput" />
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="draft.bezahlt" />
            <span>Bezahlt</span>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveVertrag()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .page-header h1 { margin: 0; color: #1f2a44; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .btn-add:hover { background: #2f4ac7; }
    .table-wrap { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 14px; text-align: left; font-size: 13px; }
    th { background: #f1f3f8; color: #1f2a44; font-weight: 600; border-bottom: 1px solid #dfe3ee; }
    tbody tr { border-top: 1px solid #f0f1f5; }
    tbody tr:hover { background: #fafbff; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 12px; }
    .badge.done { background: #b6e3b6; }
    .empty { color: #999; text-align: center; padding: 18px; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 420px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .modal label.checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
    .modal input[type="text"],
    .modal input[type="number"],
    .modal input[type="date"],
    .modal input:not([type="checkbox"]) { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; }
    .modal input:not([type="checkbox"]):focus { outline: none; border-color: #3b5bdb; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
  `]
})
export class VertraegeComponent implements OnInit {
  private service = inject(VertragService);
  private firmaService = inject(FirmaService);
  private apService = inject(AnsprechpartnerService);

  items: Vertrag[] = [];
  firmaNames = new Map<string, string>();
  apNames = new Map<string, string>();

  addModalOpen = false;
  editingId: string | null = null;
  draft: Partial<Vertrag> = {};
  bezahlbarAmInput = '';

  ngOnInit(): void {
    forkJoin({
      firmen: this.firmaService.getAll(),
      aps: this.apService.getAll()
    }).subscribe(({ firmen, aps }) => {
      firmen.forEach(f => { if (f.id) this.firmaNames.set(f.id, f.name ?? f.standort ?? f.id); });
      aps.forEach(a => {
        if (a.id) this.apNames.set(a.id, [a.vorname, a.nachname].filter(Boolean).join(' '));
      });
      this.service.getAll().subscribe(list => (this.items = list));
    });
  }

  firmaName(id: string): string { return this.firmaNames.get(id) ?? id; }
  apName(id: string): string    { return this.apNames.get(id) ?? id; }

  openAddModal(): void {
    this.editingId = null;
    this.draft = { bezahlt: false };
    this.bezahlbarAmInput = '';
    this.addModalOpen = true;
  }

  openEditModal(v: Vertrag): void {
    this.editingId = v.id ?? null;
    this.draft = { ...v };
    if (v.bezahlbarAm) {
      const [d, m, y] = v.bezahlbarAm.split('/');
      this.bezahlbarAmInput = `${y}-${m}-${d}`;
    } else {
      this.bezahlbarAmInput = '';
    }
    this.addModalOpen = true;
  }

  closeAddModal(): void { this.addModalOpen = false; }

  saveVertrag(): void {
    if (!this.draft.ansprechpartnerId || !this.draft.firmaId) return;
    if (this.bezahlbarAmInput) {
      const [y, m, d] = this.bezahlbarAmInput.split('-');
      this.draft.bezahlbarAm = `${d}/${m}/${y}`;
    }
    const refresh = () => this.service.getAll().subscribe(list => (this.items = list));
    if (this.editingId) {
      this.service.update(this.editingId, this.draft as Vertrag).subscribe(() => {
        refresh();
        this.closeAddModal();
      });
    } else {
      this.service.create(this.draft as Vertrag).subscribe(() => {
        refresh();
        this.closeAddModal();
      });
    }
  }
}