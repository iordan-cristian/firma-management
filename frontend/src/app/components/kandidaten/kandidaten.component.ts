import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kandidat } from '../../models/kandidat.model';
import { KandidatDialogComponent } from './kandidat-dialog.component';
import { KandidatSucheComponent } from './kandidat-suche.component';

@Component({
  selector: 'app-kandidaten',
  standalone: true,
  imports: [CommonModule, KandidatDialogComponent, KandidatSucheComponent],
  template: `
    <div class="page">
      <app-kandidat-suche (kandidatSelected)="openEditModal($event)">
        <h1 sucheTitle>Kandidaten</h1>
        <button class="btn-add" (click)="openAddModal()">+ Kandidat</button>
      </app-kandidat-suche>

      <!-- Add / Edit Kandidat Popup -->
      <app-kandidat-dialog
        *ngIf="dialogKandidat"
        [kandidat]="dialogKandidat"
        (saved)="onKandidatSaved()"
        (changed)="reload()"
        (close)="closeDialog()"
      ></app-kandidat-dialog>
    </div>
  `,
  styles: [`
    h1 { margin: 0; color: #1f2a44; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .btn-add:hover { background: #2f4ac7; }
  `]
})
export class KandidatenComponent {
  @ViewChild(KandidatSucheComponent) private suche?: KandidatSucheComponent;

  /** Open Kandidat dialog: null = closed, {} = new Kandidat, otherwise the Kandidat being edited. */
  dialogKandidat: Partial<Kandidat> | null = null;

  reload(): void {
    this.suche?.reload();
  }

  openAddModal(): void {
    this.dialogKandidat = {};
  }

  openEditModal(k: Kandidat): void {
    this.dialogKandidat = k;
  }

  closeDialog(): void {
    this.dialogKandidat = null;
  }

  onKandidatSaved(): void {
    this.reload();
    this.closeDialog();
  }
}
