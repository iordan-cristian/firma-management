import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-investoren-suche',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Investoren - Suche"></app-work-in-progress>`
})
export class InvestorenSucheComponent {}
