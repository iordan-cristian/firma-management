import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-kandidaten-perm-suche',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Kandidaten (Perm) - Suche"></app-work-in-progress>`
})
export class KandidatenPermSucheComponent {}
