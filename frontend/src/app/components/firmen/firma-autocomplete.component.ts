import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../services/firma.service';
import { Firma } from '../../models/firma.model';

/**
 * Search field for Firmen: suggests existing Firmen containing the typed text,
 * or offers to create a new Firma with that text as name.
 */
@Component({
  selector: 'app-firma-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete">
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="text"
        (ngModelChange)="onTextChange()"
        (focus)="open = true"
        (blur)="open = false"
        (keydown.arrowDown)="move(1, $event)"
        (keydown.arrowUp)="move(-1, $event)"
        (keydown.enter)="onEnter()"
        (keydown.escape)="open = false; $event.stopPropagation()"
      />
      <ul class="suggestions" *ngIf="open && text.trim()">
        <li
          *ngFor="let f of matches; let i = index"
          [class.active]="i === activeIndex"
          (mousedown)="$event.preventDefault(); select(f)"
        >{{ f.name }}<span class="ort" *ngIf="f.standort"> · {{ f.standort }}</span></li>
        <li
          class="create"
          [class.active]="activeIndex === matches.length"
          (mousedown)="$event.preventDefault(); requestCreate()"
        >+ Neue Firma „{{ text.trim() }}“ anlegen</li>
      </ul>
    </div>
  `,
  styles: [`
    .autocomplete { position: relative; }
    input {
      width: 100%; box-sizing: border-box; padding: 8px 10px;
      border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    input:focus { outline: none; border-color: #3b5bdb; }
    .suggestions {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 10;
      list-style: none; margin: 0; padding: 4px 0; max-height: 260px; overflow-y: auto;
      background: white; border: 1px solid #dfe3ee; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.14);
    }
    .suggestions li { padding: 8px 12px; font-size: 13px; color: #333; cursor: pointer; }
    .suggestions li.active, .suggestions li:hover { background: #eef2fb; }
    .suggestions li.create { color: #3b5bdb; font-weight: 600; border-top: 1px solid #f0f1f5; }
    .ort { color: #888; }
  `]
})
export class FirmaAutocompleteComponent implements OnInit {
  private firmaService = inject(FirmaService);

  @Input() placeholder = 'Firma suchen...';
  @Input() maxResults = 10;
  /** Emits the chosen Firma, or null once the text no longer matches the chosen one. */
  @Output() firmaSelected = new EventEmitter<Firma | null>();
  /** Emits the typed text when the user wants to create a new Firma with it. */
  @Output() createFirma = new EventEmitter<string>();

  text = '';
  open = false;
  matches: Firma[] = [];
  /** -1 = nothing highlighted; matches.length = the "neue Firma" entry. */
  activeIndex = -1;

  private firmen: Firma[] = [];
  private selected: Firma | null = null;

  ngOnInit(): void {
    this.firmaService.getAll().subscribe(list => {
      this.firmen = list;
      this.updateMatches();
    });
  }

  onTextChange(): void {
    this.open = true;
    this.activeIndex = -1;
    this.updateMatches();
    if (this.selected) {
      this.selected = null;
      this.firmaSelected.emit(null);
    }
  }

  move(step: number, event: Event): void {
    event.preventDefault();
    if (!this.text.trim()) return;
    this.open = true;
    const count = this.matches.length + 1;
    this.activeIndex = (this.activeIndex + step + count) % count;
  }

  onEnter(): void {
    if (!this.text.trim()) return;
    if (this.activeIndex >= 0 && this.activeIndex < this.matches.length) {
      this.select(this.matches[this.activeIndex]);
      return;
    }
    const needle = this.text.trim().toLowerCase();
    const exact = this.matches.find(f => f.name?.trim().toLowerCase() === needle);
    if (exact && this.activeIndex !== this.matches.length) this.select(exact);
    else this.requestCreate();
  }

  select(firma: Firma): void {
    this.selected = firma;
    this.text = firma.name ?? '';
    this.open = false;
    this.activeIndex = -1;
    this.firmaSelected.emit(firma);
  }

  requestCreate(): void {
    this.open = false;
    this.createFirma.emit(this.text.trim());
  }

  private updateMatches(): void {
    const needle = this.text.trim().toLowerCase();
    this.matches = needle
      ? this.firmen.filter(f => f.name?.toLowerCase().includes(needle)).slice(0, this.maxResults)
      : [];
  }
}
