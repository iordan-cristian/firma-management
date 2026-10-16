import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { FirmaService } from '../../services/firma.service';
import { SuchauftragService } from '../../services/suchauftrag.service';
import { KandidatService } from '../../services/kandidat.service';
import { MatchKandidatService, MatchKandidatResult } from '../../services/match-kandidat.service';
import { VerknuepfungService } from '../../services/verknuepfung.service';
import { KandidatExportService } from '../../services/kandidat-export.service';
import { Firma } from '../../models/firma.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { SCHWERPUNKT_OPTIONS } from '../../models/allgemeiner-schwerpunkt.model';
import { Suchauftrag, AKTIVITAET_OPTIONS, STATUS_OPTIONS } from '../../models/suchauftrag.model';
import { Kandidat, GESCHLECHT_OPTIONS, TITEL_OPTIONS, SPRACHNIVEAU_OPTIONS, FUEHRERSCHEIN_OPTIONS } from '../../models/kandidat.model';
import { VerknuepfungKandidat } from '../../models/verknuepfung.model';
import { MatchedKandidatenPanelComponent } from './matched-kandidaten-panel.component';

export interface SuchauftragVerknuepfungenChangedEvent {
  suchauftragId: string;
  verknuepfungen: VerknuepfungKandidat[];
}

/**
 * Add / edit a Suchauftrag of a Firma, incl. its Verknüpfungen, the matched Kandidaten
 * and the Kandidat detail panel.
 */
@Component({
  selector: 'app-suchauftrag-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchedKandidatenPanelComponent],
  template: `
    <div class="modal-backdrop">
      <div [class]="(matchedKandidatenOpen || kandidatDetailOpen) ? 'modal-duo' : ''">
        <div class="modal modal-suchauftrag">
          <h2>{{ editingSuchauftragId ? 'Suchauftrag der ' + firma.name + ' bearbeiten' : 'Neuer Suchauftrag für ' + firma.name }}</h2>
          <div class="modal-form-content">
            <ng-container *ngIf="draftSuchauftragVerknuepfungen.length">
              <div class="section-title">Verknüpfungen</div>
              <div class="verknuepfung-list">
                <div class="verknuepfung-item" *ngFor="let v of draftSuchauftragVerknuepfungen">
                  <span class="verknuepfung-name">{{ v.vorname }} {{ v.nachname }}</span>
                  <span class="verknuepfung-position" *ngIf="v.position">{{ v.position }}</span>
                  <button class="btn-link" (click)="openVerknuepfungKandidat(v.kandidatId)" title="Kandidat öffnen">→</button>
                  <button class="btn-link btn-danger" (click)="deleteVerknuepfung(v.kandidatId)" title="Löschen">✕</button>
                </div>
              </div>
            </ng-container>
            <div class="section-title">Allgemein</div>
            <label>Ansprechpartner *
              <select [(ngModel)]="draftSuchauftrag.ansprechpartnerId">
                <option value="" disabled>— auswählen —</option>
                <option *ngFor="let a of ansprechpartnerList" [value]="a.id">{{ a.vorname }} {{ a.nachname }}</option>
              </select>
            </label>
            <label>Status *
              <select [(ngModel)]="draftSuchauftrag.status">
                <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
              </select>
            </label>
            <label>Anlage Datum
              <input type="date" [(ngModel)]="anlageDatumInput" />
            </label>
            <label>Aktivität *
              <select [(ngModel)]="draftSuchauftrag.aktivitaet">
                <option *ngFor="let k of aktivitaetOptions" [value]="k">{{ k }}</option>
              </select>
            </label>
            <label>Suche Nach
              <input [(ngModel)]="draftSuchauftrag.sucheNach" placeholder="Suche nach ..." />
            </label>

            <div class="section-title">Arbeitsplatz</div>
            <label>Ort
              <input [(ngModel)]="draftSuchauftrag.ort" placeholder="Ort" />
            </label>
            <label>Postleitzahl
              <input [(ngModel)]="draftSuchauftrag.postleitzahl" placeholder="PLZ" />
            </label>
            <label>Adresse
              <input [(ngModel)]="draftSuchauftrag.adresse" placeholder="Straße und Nummer" />
            </label>
            
             <div class="section-title">Kandidat</div>
            <label>
              <span class="label-row">
                Allgemeiner Schwerpunkt
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="allgemeinerSchwerpunktKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.allgemeinerSchwerpunktKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <select [(ngModel)]="draftSuchauftrag.allgemeinerSchwerpunkt">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
              </select>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.allgemeinerSchwerpunkt, draftSuchauftrag.allgemeinerSchwerpunktKOKriterium)">Allgemeiner Schwerpunkt ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>
              <span class="label-row">
                Fachlicher Skill
                <span class="ko-checkbox-group">
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="fachlicherSkillMindestensEin" title="Mindestens ein" [ngModel]="draftSuchauftrag.fachlicherSkillMindestensEin" (ngModelChange)="setExclusive(draftSuchauftrag, 'fachlicherSkillMindestensEin', 'fachlicherSkillKOKriterium', $event)" />
                    Mindestens ein
                  </span>
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="fachlicherSkillKOKriterium" title="KO Kriterium" [ngModel]="draftSuchauftrag.fachlicherSkillKOKriterium" (ngModelChange)="setExclusive(draftSuchauftrag, 'fachlicherSkillKOKriterium', 'fachlicherSkillMindestensEin', $event)" />
                    KO Kriterium
                  </span>
                </span>
              </span>
              <textarea rows="4" [(ngModel)]="draftSuchauftrag.fachlicherSkill" placeholder="z.B. Java, SAP, CAD"></textarea>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.fachlicherSkill, draftSuchauftrag.fachlicherSkillKOKriterium)">Fachlicher Skill ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <ng-container *ngIf="draftSuchauftrag.fachlicherSkillKOKriterium">
              <label>Optionale Fachliche Skills
                <textarea rows="4" [(ngModel)]="draftSuchauftrag.optionalFachlicheSkills" placeholder="z.B. Kotlin, Scrum"></textarea>
              </label>
            </ng-container>
            <label>
              <span class="label-row">
                Gehalt
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="gehaltKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.gehaltKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <div class="input-suffix-wrapper">
                <input [(ngModel)]="draftSuchauftrag.gehalt" (input)="filterGehalt($event, 'suchauftrag')" placeholder="z.B. 60000-80000" />
                <span class="input-suffix">(Tausend €)</span>
              </div>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.gehalt, draftSuchauftrag.gehaltKOKriterium)">Gehalt ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>Gehalt Mehr Info
              <input [(ngModel)]="draftSuchauftrag.gehaltMehrInfo" placeholder="z.B. Bonus, Nebenleistungen" />
            </label>
            <label>
              <span class="label-row">
                Berufserfahrung
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="berufserfahrungKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.berufserfahrungKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <input type="number" min="0" [(ngModel)]="draftSuchauftrag.berufserfahrung" placeholder="z.B. 5" />
              <span class="field-error" *ngIf="koError(draftSuchauftrag.berufserfahrung, draftSuchauftrag.berufserfahrungKOKriterium)">Berufserfahrung ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>
              <span class="label-row">
                Branchenkenntnisse
                <span class="ko-checkbox-group">
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="branchenkenntnisseMindestensEin" title="Mindestens ein" [ngModel]="draftSuchauftrag.branchenkenntnisseMindestensEin" (ngModelChange)="setExclusive(draftSuchauftrag, 'branchenkenntnisseMindestensEin', 'branchenkenntnisseKOKriterium', $event)" />
                    Mindestens ein
                  </span>
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="branchenkenntnisseKOKriterium" title="KO Kriterium" [ngModel]="draftSuchauftrag.branchenkenntnisseKOKriterium" (ngModelChange)="setExclusive(draftSuchauftrag, 'branchenkenntnisseKOKriterium', 'branchenkenntnisseMindestensEin', $event)" />
                    KO Kriterium
                  </span>
                </span>
              </span>
              <textarea rows="4" [(ngModel)]="draftSuchauftrag.branchenkenntnisse" placeholder="z.B. Automotive, IT"></textarea>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.branchenkenntnisse, draftSuchauftrag.branchenkenntnisseKOKriterium)">Branchenkenntnisse ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <ng-container *ngIf="draftSuchauftrag.branchenkenntnisseKOKriterium">
              <label>Optionale Branchenkenntnisse
                <textarea rows="4" [(ngModel)]="draftSuchauftrag.optionalBranchenkenntnisse" placeholder="z.B. E-Commerce, Handel"></textarea>
              </label>
            </ng-container>
            <label>
              <span class="label-row">
                Zertifikate
                <span class="ko-checkbox-group">
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="zertifikateMindestensEin" title="Mindestens ein" [ngModel]="draftSuchauftrag.zertifikateMindestensEin" (ngModelChange)="setExclusive(draftSuchauftrag, 'zertifikateMindestensEin', 'zertifikateKOKriterium', $event)" />
                    Mindestens ein
                  </span>
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" name="zertifikateKOKriterium" title="KO Kriterium" [ngModel]="draftSuchauftrag.zertifikateKOKriterium" (ngModelChange)="setExclusive(draftSuchauftrag, 'zertifikateKOKriterium', 'zertifikateMindestensEin', $event)" />
                    KO Kriterium
                  </span>
                </span>
              </span>
              <input [(ngModel)]="draftSuchauftrag.zertifikate" placeholder="z.B. PMP, ISO 9001" />
              <span class="field-error" *ngIf="koError(draftSuchauftrag.zertifikate, draftSuchauftrag.zertifikateKOKriterium)">Zertifikate ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <ng-container *ngIf="draftSuchauftrag.zertifikateKOKriterium">
              <label>Optionale Zertifikate
                <input [(ngModel)]="draftSuchauftrag.optionalZertifikate" placeholder="z.B. Scrum Master, Prince2" />
              </label>
            </ng-container>
            <label>
              <span class="label-row">
                Deutsch
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="deutschKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.deutschKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <select [(ngModel)]="draftSuchauftrag.deutsch">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
              </select>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.deutsch, draftSuchauftrag.deutschKOKriterium)">Deutsch ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>
              <span class="label-row">
                Englisch
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="englischKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.englischKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <select [(ngModel)]="draftSuchauftrag.englisch">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
              </select>
              <span class="field-error" *ngIf="koError(draftSuchauftrag.englisch, draftSuchauftrag.englischKOKriterium)">Englisch ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>
              <span class="label-row">
                Sonstige Sprachen
                <span class="ko-checkbox-label">
                  <input type="checkbox" class="ko-checkbox" name="sonstigeSprachenKOKriterium" title="KO Kriterium" [(ngModel)]="draftSuchauftrag.sonstigeSprachenKOKriterium" />
                  KO Kriterium
                </span>
              </span>
              <input [(ngModel)]="draftSuchauftrag.sonstigeSprachen" placeholder="z.B. Französisch B2, Spanisch A2" />
              <span class="field-error" *ngIf="koError(draftSuchauftrag.sonstigeSprachen, draftSuchauftrag.sonstigeSprachenKOKriterium)">Sonstige Sprachen ist als KO-Kriterium markiert und darf nicht leer sein.</span>
            </label>
            <label>Informationen
              <textarea [(ngModel)]="draftSuchauftrag.informationen" placeholder="Notizen..." rows="8" style="min-height:160px"></textarea>
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn-save" [disabled]="suchauftragKOError" (click)="saveSuchauftrag()">Speichern</button>
            <button class="btn-match" [disabled]="suchauftragKOError" (click)="openMatchedKandidaten()">Match option</button>
            <button class="btn-cancel" (click)="close.emit()">Abbrechen</button>
          </div>
        </div>

        <app-matched-kandidaten-panel
          *ngIf="matchedKandidatenOpen"
          [results]="matchedKandidaten"
          [kriterienExplained]="matchKriterienExplained"
          [maxScore]="matchMaxScore"
          [selectedKandidatId]="selectedKandidat?.id"
          (kandidatOpened)="openKandidatDetail($event)"
          (verknuepfung)="onVerknuepfung($event)"
          (close)="matchedKandidatenOpen = false; kandidatDetailOpen = false"
        ></app-matched-kandidaten-panel>

        <!-- Full Kandidat detail panel -->
        <div class="modal modal-kandidat-detail" *ngIf="kandidatDetailOpen">
          <div class="match-header">
            <h2>{{ draftKandidat.vorname }} {{ draftKandidat.nachname }}</h2>
            <button class="close" (click)="kandidatDetailOpen = false">✕</button>
          </div>
          <div class="modal-form-content">
            <div class="k-section">Persönliche Daten</div>
            <div class="form-row">
              <label>Geschlecht
                <select [(ngModel)]="draftKandidat.geschlecht">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of geschlechtOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Titel
                <select [(ngModel)]="draftKandidat.titel">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of titelOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <div class="form-row">
              <label>Vorname <input [(ngModel)]="draftKandidat.vorname" /></label>
              <label>Nachname <input [(ngModel)]="draftKandidat.nachname" /></label>
            </div>
            <div class="form-row">
              <label>PLZ <input type="number" [(ngModel)]="draftKandidat.postleitzahl" /></label>
              <label>Ort <input [(ngModel)]="draftKandidat.ort" /></label>
            </div>
            <div class="form-row">
              <label>Geburtsjahr <input type="number" [(ngModel)]="draftKandidat.geburtsjahr" /></label>
              <label>Staatsangehörigkeit <input [(ngModel)]="draftKandidat.staatsangehoerigkeit" /></label>
            </div>
            <div class="form-row">
              <label>Familienstand <input [(ngModel)]="draftKandidat.familienstand" /></label>
              <label>Kinder <input [(ngModel)]="draftKandidat.kinder" /></label>
            </div>

            <div class="k-section">Berufliche Anforderungen</div>
            <div class="form-row">
              <label>Wochenstunden <input [(ngModel)]="draftKandidat.wochenstunden" /></label>
              <label>Gehalt
                <div class="input-suffix-wrapper">
                  <input [(ngModel)]="draftKandidat.gehalt" (input)="filterGehalt($event, 'kandidat')" />
                  <span class="input-suffix">(Tausend €)</span>
                </div>
              </label>
            </div>
            <div class="form-row">
              <label>Wochenendbereitschaft <input [(ngModel)]="draftKandidat.wochenendbereitschaft" /></label>
              <label>Homeoffice <input [(ngModel)]="draftKandidat.homeoffice" /></label>
            </div>
            <div class="form-row">
              <label>Firmenwagen <input [(ngModel)]="draftKandidat.firmenwagenregelung" /></label>
              <label>Reisen m. Übernachtung <input [(ngModel)]="draftKandidat.reisetaetigkeitenMitUebernachtung" /></label>
            </div>
            <label>Tägliche Fahrzeit (Min.) <input type="number" [(ngModel)]="draftKandidat.taeglicheFahrzeit" /></label>

            <div class="k-section">Sprachkenntnisse</div>
            <div class="form-row">
              <label>Deutsch
                <select [(ngModel)]="draftKandidat.deutsch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Englisch
                <select [(ngModel)]="draftKandidat.englisch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <label>Sonstige Sprachen <input [(ngModel)]="draftKandidat.sonstigeSprachen" /></label>

            <div class="k-section">Qualifikationen</div>
            <div class="form-row">
              <label>Hochschulabschluss <input [(ngModel)]="draftKandidat.hochschulabschluss" /></label>
              <label>Berufsausbildung <input [(ngModel)]="draftKandidat.berufsausbildung" /></label>
            </div>
            <div class="form-row">
              <label>Autoführerschein
                <select [(ngModel)]="draftKandidat.autofuehrerschein">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of fuehrerscheinOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Zertifikate <input [(ngModel)]="draftKandidat.zertifikate" /></label>
            </div>

            <div class="k-section">Berufserfahrung</div>
            <label>Allgemeiner Schwerpunkt *
              <select [(ngModel)]="draftKandidat.allgemeinerSchwerpunkt">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
              </select>
              <span class="field-error" *ngIf="!draftKandidat.allgemeinerSchwerpunkt">Allgemeiner Schwerpunkt ist ein Pflichtfeld.</span>
            </label>
            <label>Fachlicher Skill <textarea rows="4" [(ngModel)]="draftKandidat.fachlicherSkill" placeholder="Fachlicher Skill"></textarea></label>
            <label>Branchenkenntnisse <textarea rows="4" [(ngModel)]="draftKandidat.branchenkenntnisse"></textarea></label>
            <label>Berufserfahrung <input type="number" min="0" [(ngModel)]="draftKandidat.berufserfahrung" placeholder="z.B. 5" /></label>
            <label>Aktuelle Tätigkeiten <input [(ngModel)]="draftKandidat.aktuelleTaetigkeiten" /></label>
            <label>Aktuelle Position <input [(ngModel)]="draftKandidat.aktuellePosition" /></label>
            <label>Aktuelle Firma <input [(ngModel)]="draftKandidat.aktuelleFirma" /></label>

            <div class="k-section">Wechsel &amp; Zukunft</div>
            <label>Wechselgründe <input [(ngModel)]="draftKandidat.wechselgruende" /></label>
            <label>Zukünftige Position <input [(ngModel)]="draftKandidat.zukuenftigePositionTaetigkeiten" /></label>
            <div class="form-row">
              <label>Kündigungsfrist <input [(ngModel)]="draftKandidat.kuendigungsfrist" /></label>
              <label>Erstes Online-Meeting <input [(ngModel)]="draftKandidat.erstesOnlineMeeting" /></label>
            </div>
          </div>
          <div class="modal-actions">
            <div class="dropdown">
              <button type="button" class="btn-export" (click)="kandidatExportMenuOpen = !kandidatExportMenuOpen">Export ▾</button>
              <div class="dropdown-menu" *ngIf="kandidatExportMenuOpen">
                <button type="button" (click)="exportKandidatdaten()">Export Kandidatdaten</button>
                <button type="button" (click)="exportKandidatdatenAnonymisiert()">Export Kandidatdaten anonymisiert</button>
                <button type="button" (click)="exportKandidatdatenPdf()">Export Kandidatdaten als PDF</button>
                <button type="button" (click)="exportKandidatdatenAnonymisiertPdf()">Export Kandidatdaten anonymisiert als PDF</button>
              </div>
            </div>
            <span class="import-status" *ngIf="kandidatExportStatus">{{ kandidatExportStatus }}</span>
            <button class="btn-save" [disabled]="!draftKandidat.allgemeinerSchwerpunkt" (click)="saveKandidatDetail()">Speichern</button>
            <button class="btn-cancel" (click)="kandidatDetailOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .close { background: transparent; border: 1px solid #dfe3ee; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px; width: 420px; max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { margin: 0 0 20px; color: #1f2a44; font-size: 18px; }
    .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .modal label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 14px; }
    .label-row { display: flex; align-items: center; justify-content: space-between; }
    .label-row .ko-checkbox { margin: 0; }
    .ko-checkbox-label { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: normal; color: #8a90a2; }
    .ko-checkbox-group { display: flex; align-items: center; gap: 12px; }
    .modal input:not([type="checkbox"]), .modal select, .modal textarea {
      padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    .modal input:not([type="checkbox"]):focus, .modal select:focus, .modal textarea:focus {
      outline: none; border-color: #3b5bdb;
    }
    .modal textarea { resize: vertical; }
    .modal-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .dropdown { position: relative; margin-right: auto; }
    .btn-export { background: transparent; border: 1px solid #dfe3ee; color: #3b5bdb; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .btn-export:hover { background: #f1f3f8; }
    .dropdown-menu {
      position: absolute; bottom: calc(100% + 6px); left: 0; min-width: 240px;
      background: white; border: 1px solid #dfe3ee; border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.14); overflow: hidden; z-index: 10;
    }
    .dropdown-menu button {
      display: block; width: 100%; text-align: left; padding: 10px 14px;
      border: none; background: none; font-size: 13px; color: #333; cursor: pointer;
    }
    .dropdown-menu button:hover { background: #f5f7fc; }
    .import-status { font-size: 12px; color: #3b5bdb; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-save:disabled { background: #a9b4d6; cursor: not-allowed; }
    .btn-match { background: #2f9e44; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-match:hover { background: #258836; }
    .btn-match:disabled { background: #9dcfa9; cursor: not-allowed; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .btn-danger { color: #e03131; }
    .btn-danger:hover:not(:disabled) { background: #ffeaea; border-color: #e03131; }
    .verknuepfung-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .verknuepfung-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: #f5f7fc; border-radius: 6px; border: 1px solid #e5e9f3; }
    .verknuepfung-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .verknuepfung-position { font-size: 11px; color: #888; white-space: nowrap; flex-shrink: 0; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
    .input-suffix-wrapper { display: flex; align-items: stretch; border: 1px solid #dfe3ee; border-radius: 6px; overflow: hidden; }
    .input-suffix-wrapper:focus-within { border-color: #3b5bdb; }
    .modal .input-suffix-wrapper input { flex: 1; border: none; outline: none; background: transparent; min-width: 0; }
    .input-suffix { display: flex; align-items: center; padding: 0 8px; background: #f1f3f8; color: #888; font-size: 12px; white-space: nowrap; border-left: 1px solid #dfe3ee; pointer-events: none; user-select: none; }

    .modal-duo { display: flex; gap: 20px; align-items: stretch; }
    .modal-suchauftrag { display: flex; flex-direction: column; overflow: hidden; }
    .modal-form-content { overflow-y: auto; flex: 1; }
    .match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .match-header h2 { margin: 0; color: #1f2a44; font-size: 18px; }
    .modal-kandidat-detail { width: 540px; flex-shrink: 0; display: flex; flex-direction: column; }
    .k-section { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 16px 0 8px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  `]
})
export class SuchauftragDialogComponent implements OnInit {
  private firmaService = inject(FirmaService);
  private suchauftragService = inject(SuchauftragService);
  private kandidatService = inject(KandidatService);
  private matchKandidatService = inject(MatchKandidatService);
  private verknuepfungService = inject(VerknuepfungService);
  private kandidatExportService = inject(KandidatExportService);

  /** Firma the Suchauftrag belongs to; its Ansprechpartner can be chosen. */
  @Input({ required: true }) firma!: Firma;
  /** Suchauftrag to edit; omit to create a new one. */
  @Input() suchauftrag?: Suchauftrag;
  /** Ansprechpartner preselected for a new Suchauftrag. */
  @Input() ansprechpartnerId?: string;
  /** Run MatchKandidat for the given Suchauftrag right away and show the matched Kandidaten. */
  @Input() autoMatch = false;
  /** Emits every time the Suchauftrag was stored (Speichern, and before matching). */
  @Output() saved = new EventEmitter<Suchauftrag>();
  @Output() verknuepfungenChanged = new EventEmitter<SuchauftragVerknuepfungenChangedEvent>();
  @Output() close = new EventEmitter<void>();

  readonly schwerpunktOptions = SCHWERPUNKT_OPTIONS;
  readonly aktivitaetOptions = AKTIVITAET_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;
  readonly sprachniveauOptions = SPRACHNIVEAU_OPTIONS;
  readonly fuehrerscheinOptions = FUEHRERSCHEIN_OPTIONS;

  ansprechpartnerList: Ansprechpartner[] = [];
  editingSuchauftragId: string | null = null;
  draftSuchauftrag: Partial<Suchauftrag> = {};
  draftSuchauftragVerknuepfungen: VerknuepfungKandidat[] = [];
  anlageDatumInput = '';

  matchedKandidatenOpen = false;
  matchedKandidaten: MatchKandidatResult[] = [];
  matchKriterienExplained = '';
  matchMaxScore = 0;

  kandidatDetailOpen = false;
  selectedKandidat: Kandidat | null = null;
  draftKandidat: Partial<Kandidat> = {};
  kandidatExportMenuOpen = false;
  kandidatExportStatus = '';

  ngOnInit(): void {
    if (this.firma.id) {
      this.firmaService.getAnsprechpartnerForFirma(this.firma.id).subscribe(list => (this.ansprechpartnerList = list));
    }
    const s = this.suchauftrag;
    if (s) {
      this.editingSuchauftragId = s.id ?? null;
      this.draftSuchauftrag = { ...s };
      this.draftSuchauftrag.gehalt = this.gehaltDisplay(s.gehaltMinimum, s.gehaltMaximum) ?? undefined;
      if (s.id) {
        this.verknuepfungService.getKandidatenForSuchauftrag(s.id).subscribe(links => (this.draftSuchauftragVerknuepfungen = links));
      }
      if (s.anlageDatum) {
        const [d, m, y] = s.anlageDatum.split('/');
        this.anlageDatumInput = `${y}-${m}-${d}`;
      }
      if (this.autoMatch && s.id) {
        this.matchedKandidatenOpen = true;
        this.runMatch(s.id);
      }
    } else {
      this.draftSuchauftrag = { ansprechpartnerId: this.ansprechpartnerId, aktivitaet: 'Personal', status: 'in Arbeit', allgemeinerSchwerpunktKOKriterium: true };
      const now = new Date();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      this.anlageDatumInput = `${now.getFullYear()}-${m}-${d}`;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.kandidatExportMenuOpen && !(event.target as HTMLElement).closest('.dropdown')) {
      this.kandidatExportMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  // ── Suchauftrag ──────────────────────────────────────────
  saveSuchauftrag(): void {
    this.buildSuchauftragSaveRequest().subscribe(saved => {
      this.saved.emit(saved);
      this.close.emit();
    });
  }

  /** Builds (but does not subscribe to) the create/update request for the current draftSuchauftrag. */
  private buildSuchauftragSaveRequest(): Observable<Suchauftrag> {
    if (!this.draftSuchauftrag.ansprechpartnerId) return EMPTY;
    [this.draftSuchauftrag.gehaltMinimum, this.draftSuchauftrag.gehaltMaximum] = this.parseGehalt(this.draftSuchauftrag.gehalt, 'suchauftrag');
    if (this.anlageDatumInput) {
      const [y, m, d] = this.anlageDatumInput.split('-');
      this.draftSuchauftrag.anlageDatum = `${d}/${m}/${y}`;
    } else {
      this.draftSuchauftrag.anlageDatum = undefined;
    }
    return this.editingSuchauftragId
      ? this.suchauftragService.update(this.editingSuchauftragId, this.draftSuchauftrag as Suchauftrag)
      : this.suchauftragService.create(this.draftSuchauftrag as Suchauftrag);
  }

  koError(value: string | number | undefined | null, checked: boolean | undefined): boolean {
    return !!checked && (value === undefined || value === null || value.toString().trim() === '');
  }

  get suchauftragKOError(): boolean {
    const s = this.draftSuchauftrag;
    return this.koError(s.allgemeinerSchwerpunkt, s.allgemeinerSchwerpunktKOKriterium)
      || this.koError(s.fachlicherSkill, s.fachlicherSkillKOKriterium)
      || this.koError(s.gehalt, s.gehaltKOKriterium)
      || this.koError(s.berufserfahrung, s.berufserfahrungKOKriterium)
      || this.koError(s.branchenkenntnisse, s.branchenkenntnisseKOKriterium)
      || this.koError(s.zertifikate, s.zertifikateKOKriterium)
      || this.koError(s.deutsch, s.deutschKOKriterium)
      || this.koError(s.englisch, s.englischKOKriterium)
      || this.koError(s.sonstigeSprachen, s.sonstigeSprachenKOKriterium);
  }

  setExclusive(target: any, changedField: string, otherField: string, value: boolean): void {
    target[changedField] = value;
    if (value) target[otherField] = false;
  }

  filterGehalt(e: Event, target: 'suchauftrag' | 'kandidat'): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^0-9,\-]/g, '');
    if (target === 'suchauftrag') this.draftSuchauftrag.gehalt = el.value;
    else this.draftKandidat.gehalt = el.value;
  }

  // ── Verknüpfungen ────────────────────────────────────────
  openVerknuepfungKandidat(kandidatId: string): void {
    this.kandidatService.getById(kandidatId).subscribe(k => this.openKandidatDetail(k));
  }

  deleteVerknuepfung(kandidatId: string): void {
    if (!this.draftSuchauftrag.id) return;
    this.verknuepfungService.deleteLink(this.draftSuchauftrag.id, kandidatId).subscribe(() => {
      this.setVerknuepfungen(this.draftSuchauftragVerknuepfungen.filter(v => v.kandidatId !== kandidatId));
    });
  }

  onVerknuepfung(kandidat: Kandidat): void {
    if (!kandidat.id || !this.draftSuchauftrag.id || !this.firma.id) return;
    const kandidatId = kandidat.id;
    if (this.draftSuchauftragVerknuepfungen.some(v => v.kandidatId === kandidatId)) return;

    this.verknuepfungService.create({
      kandidatId,
      suchauftragId: this.draftSuchauftrag.id,
      firmaId: this.firma.id,
    }).subscribe(() => {
      const link: VerknuepfungKandidat = { kandidatId, vorname: kandidat.vorname, nachname: kandidat.nachname, position: kandidat.aktuellePosition };
      this.setVerknuepfungen([...this.draftSuchauftragVerknuepfungen, link]);
    });
  }

  private setVerknuepfungen(verknuepfungen: VerknuepfungKandidat[]): void {
    this.draftSuchauftragVerknuepfungen = verknuepfungen;
    if (this.draftSuchauftrag.id) {
      this.verknuepfungenChanged.emit({ suchauftragId: this.draftSuchauftrag.id, verknuepfungen });
    }
  }

  // ── Matched Kandidaten ───────────────────────────────────
  /** Stores the Suchauftrag (matching needs its id) and loads the matching Kandidaten. */
  openMatchedKandidaten(): void {
    this.matchedKandidatenOpen = true;
    this.kandidatDetailOpen = false;
    this.selectedKandidat = null;
    this.buildSuchauftragSaveRequest().subscribe(saved => {
      this.draftSuchauftrag = { ...this.draftSuchauftrag, ...saved };
      this.editingSuchauftragId = saved.id ?? null;
      this.saved.emit(saved);
      this.runMatch(saved.id!);
    });
  }

  private runMatch(suchauftragId: string): void {
    this.matchKandidatService.matchKandidat({ suchauftragId }).subscribe(response => {
      this.matchKriterienExplained = response.kriterienExplained;
      this.matchMaxScore = response.maxScore;
      this.matchedKandidaten = response.results;
      if (response.results.length === 1) this.openKandidatDetail(response.results[0].kandidat);
    });
  }

  // ── Kandidat detail ──────────────────────────────────────
  openKandidatDetail(k: Kandidat): void {
    this.selectedKandidat = k;
    this.draftKandidat = { ...k };
    this.draftKandidat.gehalt = this.gehaltDisplay(k.gehaltMinimum, k.gehaltMaximum) ?? undefined;
    this.kandidatExportMenuOpen = false;
    this.kandidatExportStatus = '';
    this.kandidatDetailOpen = true;
  }

  saveKandidatDetail(): void {
    if (!this.selectedKandidat?.id) return;
    [this.draftKandidat.gehaltMinimum, this.draftKandidat.gehaltMaximum] = this.parseGehalt(this.draftKandidat.gehalt, 'kandidat');
    this.kandidatService.update(this.selectedKandidat.id, this.draftKandidat as Kandidat).subscribe(updated => {
      this.matchedKandidaten = this.matchedKandidaten.map(r => r.kandidat.id === updated.id ? { ...r, kandidat: updated } : r);
      this.kandidatDetailOpen = false;
      this.selectedKandidat = null;
    });
  }

  exportKandidatdaten(): void {
    this.copyKandidatExportToClipboard(false);
  }

  exportKandidatdatenAnonymisiert(): void {
    this.copyKandidatExportToClipboard(true);
  }

  exportKandidatdatenPdf(): void {
    this.exportKandidatAsPdf(false);
  }

  exportKandidatdatenAnonymisiertPdf(): void {
    this.exportKandidatAsPdf(true);
  }

  private copyKandidatExportToClipboard(anonymisiert: boolean): void {
    this.kandidatExportService.copyToClipboard(this.draftKandidat, anonymisiert).then(() => {
      this.kandidatExportStatus = 'In Zwischenablage kopiert.';
      setTimeout(() => (this.kandidatExportStatus = ''), 2500);
    });
    this.kandidatExportMenuOpen = false;
  }

  private exportKandidatAsPdf(anonymisiert: boolean): void {
    this.kandidatExportService.exportAsPdf(this.draftKandidat, anonymisiert).then(() => {
      this.kandidatExportStatus = 'PDF erstellt.';
      setTimeout(() => (this.kandidatExportStatus = ''), 2500);
    });
    this.kandidatExportMenuOpen = false;
  }

  // ── Helpers ──────────────────────────────────────────────
  gehaltDisplay(min?: number, max?: number): string | null {
    if (min != null && max != null) return `${min}-${max}`;
    if (min != null) return `${min}`;
    if (max != null) return `${max}`;
    return null;
  }

  private parseGehalt(raw: string | undefined, type: 'kandidat' | 'suchauftrag'): [number | undefined, number | undefined] {
    const s = raw?.replace(/,/g, '').trim() ?? '';
    if (!s) return [undefined, undefined];
    const dash = s.indexOf('-');
    if (dash > 0) {
      const min = parseFloat(s.slice(0, dash));
      const max = parseFloat(s.slice(dash + 1));
      return [isNaN(min) ? undefined : min, isNaN(max) ? undefined : max];
    }
    const val = parseFloat(s);
    const v = isNaN(val) ? undefined : val;
    return type === 'kandidat' ? [v, undefined] : [undefined, v];
  }
}