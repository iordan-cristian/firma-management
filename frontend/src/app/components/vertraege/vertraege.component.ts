import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertragService } from '../../services/vertrag.service';
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
              <th>Firma ID</th>
              <th>Ansprechpartner ID</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let v of items">
              <td>{{ v.bezahlbarAm }}</td>
              <td>{{ v.wert | number:'1.2-2' }} €</td>
              <td>
                <span class="badge" [class.done]="v.bezahlt">{{ v.bezahlt ? 'Ja' : 'Nein' }}</span>
              </td>
              <td class="mono">{{ v.firmaId }}</td>
              <td class="mono">{{ v.ansprechpartnerId }}</td>
            </tr>
            <tr *ngIf="!items.length"><td colspan="5" class="empty">No Verträge yet.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Add Vertrag Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen" (click)="closeAddModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Neuer Vertrag</h2>
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
    .mono { font-family: ui-monospace, monospace; font-size: 11px; color: #666; }
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

  items: Vertrag[] = [];
  addModalOpen = false;
  draft: Partial<Vertrag> = {};
  bezahlbarAmInput = '';

  ngOnInit(): void {
    this.service.getAll().subscribe(list => (this.items = list));
  }

  openAddModal(): void {
    this.draft = { bezahlt: false };
    this.bezahlbarAmInput = '';
    this.addModalOpen = true;
  }

  closeAddModal(): void { this.addModalOpen = false; }

  saveVertrag(): void {
    if (!this.draft.ansprechpartnerId || !this.draft.firmaId) return;
    if (this.bezahlbarAmInput) {
      const [y, m, d] = this.bezahlbarAmInput.split('-');
      this.draft.bezahlbarAm = `${d}/${m}/${y}`;
    }
    this.service.create(this.draft as Vertrag).subscribe(() => {
      this.service.getAll().subscribe(list => (this.items = list));
      this.closeAddModal();
    });
  }
}
