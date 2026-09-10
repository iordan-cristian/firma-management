import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-immobilien-suche',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Immobilien - Suche"></app-work-in-progress>`
})
export class ImmobilienSucheComponent {}
