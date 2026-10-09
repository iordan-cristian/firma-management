import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import { Kandidat } from '../../models/kandidat.model';

/**
 * Kandidaten search: name / E-Mail / Telefon search.
 * Loads the Kandidaten itself and emits the filtered list via (results); call reload() after changes made elsewhere.
 * Content marked with [sucheTitle] is shown left in the toolbar, [sucheFilter] before the search field,
 * other content right after the search field.
 */
@Component({
  selector: 'app-kandidat-suche',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <ng-content select="[sucheTitle]"></ng-content>
      <div class="header-right">
        <ng-content select="[sucheFilter]"></ng-content>
        <input
          class="search-input"
          type="text"
          placeholder="Suche nach Name, E-Mail oder Telefon..."
          [ngModel]="searchText"
          (ngModelChange)="searchText = $event; applyFilter()"
        />
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .search-input {
      padding: 8px 12px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 14px; width: 280px;
    }
    .search-input:focus { outline: none; border-color: #3b5bdb; }
  `]
})
export class KandidatSucheComponent implements OnInit {
  private service = inject(KandidatService);

  /** Emits the filtered Kandidaten after every load and filter change. */
  @Output() results = new EventEmitter<Kandidat[]>();

  private items: Kandidat[] = [];
  searchText = '';

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.service.getAll().subscribe(list => {
      this.items = list;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const q = this.searchText.trim().toLowerCase();
    // Phone numbers are compared digits-only so "+49 170 123" matches "+49170123"
    const qDigits = q.replace(/\D/g, '');
    this.results.emit(this.items.filter(k => !q
      || k.vorname?.toLowerCase().includes(q)
      || k.nachname?.toLowerCase().includes(q)
      || k.email?.toLowerCase().includes(q)
      || (qDigits && k.telefon?.replace(/\D/g, '').includes(qDigits))));
  }
}
