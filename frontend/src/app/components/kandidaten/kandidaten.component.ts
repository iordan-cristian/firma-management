import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KandidatService } from '../../services/kandidat.service';
import { KandidatDokumentService } from '../../services/kandidat-dokument.service';
import { XlsxImportService } from '../../services/xlsx-import.service';
import { KandidatExportService } from '../../services/kandidat-export.service';
import { MatchSuchauftragService, MatchSuchauftragResult } from '../../services/match-suchauftrag.service';
import { Suchauftrag } from '../../models/suchauftrag.model';
import {
  Kandidat,
  KandidatDokument,
  StagedDokument,
  DokumentTyp,
  GESCHLECHT_OPTIONS,
  TITEL_OPTIONS,
  SPRACHNIVEAU_OPTIONS,
  FUEHRERSCHEIN_OPTIONS,
  SCHWERPUNKT_OPTIONS,
  DOKUMENT_TYP_OPTIONS,
} from '../../models/kandidat.model';

@Component({
  selector: 'app-kandidaten',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Kandidaten</h1>
        <div class="header-right">
          <label class="checkbox-filter">
            <input type="checkbox" [(ngModel)]="onlyAbgelaufeneDsgvo" />
            Abgelaufene DSGVO-Bestätigung
          </label>
          <input
            class="search-input"
            type="text"
            placeholder="Suche nach Vorname oder Nachname..."
            [(ngModel)]="searchText"
          />
          <button class="btn-add" (click)="openAddModal()">+ Kandidat</button>
        </div>
      </header>

      <p class="hint">{{ filtered.length }} Kandidat(en) gefunden</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>PLZ / Ort</th>
              <th>Aktuelle Position</th>
              <th>Aktuelle Firma</th>
              <th>Branchenkenntnisse</th>
              <th>Deutsch</th>
              <th>Englisch</th>
              <th class="doc-col">CV</th>
              <th class="doc-col">Interview</th>
              <th class="doc-col">DSGVO</th>
              <th>Bestätigungs Datum</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let k of filtered" (dblclick)="openEditModal(k)" class="clickable" [class.row-dsgvo-expired]="isDsgvoAbgelaufen(k)">
              <td>{{ k.titel ?? '–' }}</td>
              <td>{{ k.vorname ?? '–' }}</td>
              <td>{{ k.nachname ?? '–' }}</td>
              <td>{{ k.postleitzahl ?? '' }} {{ k.ort ?? '–' }}</td>
              <td>{{ k.aktuellePosition ?? '–' }}</td>
              <td>{{ k.aktuelleFirma ?? '–' }}</td>
              <td>{{ k.branchenkenntnisse ?? '–' }}</td>
              <td>{{ k.deutsch ?? '–' }}</td>
              <td>{{ k.englisch ?? '–' }}</td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('CV')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('INTERVIEW')" disabled /></td>
              <td class="doc-col"><input type="checkbox" [checked]="k.dokumentTypen?.includes('DSGVO')" disabled /></td>
              <td>{{ formatDsgvoDatum(k.dsgvoBestaetigungsDatum) ?? '–' }}</td>
            </tr>
            <tr *ngIf="!filtered.length">
              <td colspan="8" class="empty">Keine Kandidaten gefunden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Kandidat Modal -->
      <div class="modal-backdrop" *ngIf="addModalOpen">
        <div class="modal">
          <h2>{{ editingId ? 'Kandidat bearbeiten' : 'Neuer Kandidat' }}</h2>
          <div class="modal-body">

            <div class="interview-import-row">
              <button class="btn-interview-import" type="button" (click)="interviewFileInput.click()">
                Altes Interview (.xlsx) importieren
              </button>
              <input #interviewFileInput type="file" style="display:none" accept=".xlsx" (change)="onInterviewImport($event)" />
              <span class="import-status" *ngIf="importStatus">{{ importStatus }}</span>
            </div>

            <div class="section-title">DSGVO</div>
            <label>DSGVO Bestätigungs Datum
              <div class="input-with-btn">
                <input
                  [(ngModel)]="draft.dsgvoBestaetigungsDatum"
                  placeholder="TT.MM.JJJJ"
                  (blur)="normalizeDsgvoDatum()"
                />
                <button class="btn-link" type="button" (click)="openDsgvoDatePicker(dsgvoDatePicker)" title="Datum auswählen">📅</button>
                <input
                  #dsgvoDatePicker
                  class="date-picker-hidden"
                  type="date"
                  tabindex="-1"
                  (change)="onDsgvoDatePicked($event)"
                />
              </div>
            </label>

            <div class="section-title">Persönliche Daten</div>
            <div class="form-row">
              <label>Geschlecht
                <select [(ngModel)]="draft.geschlecht">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of geschlechtOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Titel
                <select [(ngModel)]="draft.titel">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of titelOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <div class="form-row">
              <label>Vorname
                <input [(ngModel)]="draft.vorname" placeholder="Vorname" />
              </label>
              <label>Nachname
                <input [(ngModel)]="draft.nachname" placeholder="Nachname" />
              </label>
            </div>
            <div class="form-row">
              <label>Postleitzahl
                <input type="number" [(ngModel)]="draft.postleitzahl" placeholder="PLZ" />
              </label>
              <label>Ort
                <input [(ngModel)]="draft.ort" placeholder="Ort" />
              </label>
            </div>
            <div class="form-row">
              <label>Geburtsjahr
                <input type="number" [(ngModel)]="draft.geburtsjahr" placeholder="JJJJ" min="1900" max="2099" />
              </label>
              <label>Staatsangehörigkeit
                <input [(ngModel)]="draft.staatsangehoerigkeit" placeholder="Staatsangehörigkeit" />
              </label>
            </div>
            <div class="form-row">
              <label>Familienstand              <input [(ngModel)]="draft.familienstand" placeholder="z.B. ledig, verheiratet" />
              </label>
              <label>Kinder
                <input [(ngModel)]="draft.kinder" placeholder="z.B. keine, 2" />
              </label>
            </div>

            <div class="section-title">Berufliche Anforderungen</div>
            <div class="form-row">
              <label>Wochenstunden
                <input [(ngModel)]="draft.wochenstunden" placeholder="z.B. 40 oder 30-40" />
              </label>
              <label>Gehalt
                <div class="input-suffix-wrapper">
                  <input [(ngModel)]="draft.gehalt" (input)="filterGehalt($event)" placeholder="z.B. 60000 oder 55000-70000" />
                  <span class="input-suffix">(Tausend €)</span>
                </div>
              </label>
            </div>
            <div class="form-row">
              <label>Wochenendbereitschaft
                <input [(ngModel)]="draft.wochenendbereitschaft" placeholder="ja / nein / gelegentlich" />
              </label>
              <label>Homeoffice
                <input [(ngModel)]="draft.homeoffice" placeholder="z.B. 2 Tage/Woche" />
              </label>
            </div>
            <div class="form-row">
              <label>Firmenwagenregelung
                <input [(ngModel)]="draft.firmenwagenregelung" placeholder="ja / nein / gewünscht" />
              </label>
              <label>Reisetätigkeiten mit Übernachtung
                <input [(ngModel)]="draft.reisetaetigkeitenMitUebernachtung" placeholder="ja / nein / bis X Tage" />
              </label>
            </div>
            <div class="form-row">
              <label>Tägliche Fahrzeit (Min.)
                <input type="number" [(ngModel)]="draft.taeglicheFahrzeit" placeholder="Minuten" min="0" />
              </label>
            </div>

            <div class="section-title">Sprachkenntnisse</div>
            <div class="form-row">
              <label>Deutsch
                <select [(ngModel)]="draft.deutsch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Englisch
                <select [(ngModel)]="draft.englisch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
            </div>
            <label>Sonstige Sprachen
              <input [(ngModel)]="draft.sonstigeSprachen" placeholder="z.B. Französisch B2, Spanisch A2" />
            </label>

            <div class="section-title">Qualifikationen</div>
            <div class="form-row">
              <label>Hochschulabschluss
                <input [(ngModel)]="draft.hochschulabschluss" placeholder="z.B. M.Sc. Informatik" />
              </label>
              <label>Berufsausbildung
                <input [(ngModel)]="draft.berufsausbildung" placeholder="z.B. Fachinformatiker" />
              </label>
            </div>
            <div class="form-row">
              <label>Autoführerschein
                <select [(ngModel)]="draft.autofuehrerschein">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of fuehrerscheinOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Fachspezifische Zertifikate
                <input [(ngModel)]="draft.zertifikate" placeholder="z.B. AWS, PMP" />
              </label>
            </div>

            <div class="section-title">Berufserfahrung</div>
            <label>Allgemeiner Schwerpunkt *
              <select [(ngModel)]="draft.allgemeinerSchwerpunkt">
                <option [ngValue]="undefined">–</option>
                <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
              </select>
              <span class="field-error" *ngIf="!draft.allgemeinerSchwerpunkt">Allgemeiner Schwerpunkt ist ein Pflichtfeld.</span>
            </label>
            <label>Fachlicher Skill
              <textarea rows="4" [(ngModel)]="draft.fachlicherSkill" placeholder="Fachlicher Skill"></textarea>
            </label>
            <label>Branchenkenntnisse
              <textarea rows="4" [(ngModel)]="draft.branchenkenntnisse" placeholder="z.B. IT, Automotive"></textarea>
            </label>
            <label>Berufserfahrung
              <input type="number" min="0" [(ngModel)]="draft.berufserfahrung" placeholder="z.B. 5" />
            </label>
            <label>Aktuelle Tätigkeiten
              <input [(ngModel)]="draft.aktuelleTaetigkeiten" placeholder="Aktuelle Tätigkeiten" />
            </label>
            <label>Aktuelle Firma
              <input [(ngModel)]="draft.aktuelleFirma" placeholder="z.B. Siemens AG" />
            </label>

            <label>Aktuelle Position
              <input [(ngModel)]="draft.aktuellePosition" placeholder="z.B. Senior Developer" />
            </label>

            <div class="section-title">Wechsel & Zukunft</div>
            <label>Wechselgründe
              <input [(ngModel)]="draft.wechselgruende" placeholder="Wechselgründe" />
            </label>
            <label>Zukünftige Position / Tätigkeiten
              <input [(ngModel)]="draft.zukuenftigePositionTaetigkeiten" placeholder="Gewünschte Position" />
            </label>
            <div class="form-row">
              <label>Kündigungsfrist
                <input [(ngModel)]="draft.kuendigungsfrist" placeholder="z.B. 3 Monate" />
              </label>
              <label>Erstes Online-Meeting
                <input [(ngModel)]="draft.erstesOnlineMeeting" placeholder="z.B. KW 22, 10:00 Uhr" />
              </label>
            </div>
            <label>Firmen selbst beworben
              <input [(ngModel)]="draft.firmenSelbevorben" placeholder="z.B. Siemens, BMW" />
            </label>
            <label>Firmen No-Go
              <input [(ngModel)]="draft.firmenNogo" placeholder="z.B. XYZ GmbH" />
            </label>

            <div class="section-title">Kontakt Informationen</div>
            <label>E-Mail
              <div class="input-with-btn">
                <input [(ngModel)]="draft.email" placeholder="E-Mail Adresse" />
                <button class="btn-link" (click)="copyToClipboard(draft.email)" [disabled]="!draft.email">📋</button>
              </div>
              <span class="field-error" *ngIf="kandidatErrors['email']">{{ kandidatErrors['email'] }}</span>
            </label>
            <label>Telefon
              <div class="input-with-btn">
                <input [(ngModel)]="draft.telefon" placeholder="z.B. +49 30 1234567" />
                <button class="btn-link" (click)="copyToClipboard(draft.telefon)" [disabled]="!draft.telefon">📋</button>
              </div>
              <span class="field-error" *ngIf="kandidatErrors['telefon']">{{ kandidatErrors['telefon'] }}</span>
            </label>
            <label>LinkedIn Profil
              <div class="input-with-btn">
                <input [(ngModel)]="draft.linkedinProfil" placeholder="LinkedIn-URL" />
                <button class="btn-link" (click)="openLink(draft.linkedinProfil)" [disabled]="!draft.linkedinProfil">↗</button>
              </div>
            </label>
            <label>Xing Profil
              <div class="input-with-btn">
                <input [(ngModel)]="draft.xingProfil" placeholder="Xing-URL" />
                <button class="btn-link" (click)="openLink(draft.xingProfil)" [disabled]="!draft.xingProfil">↗</button>
              </div>
            </label>

            <div class="section-title">Dokumente</div>

            <div class="dokument-list" *ngIf="dokumente.length || stagedDokumente.length">
              <div class="dokument-item" *ngFor="let d of dokumente">
                <span class="dokument-typ-badge">{{ d.dokumentTyp }}</span>
                <span class="dokument-name" [title]="d.dateiname">{{ d.dateiname }}</span>
                <span class="dokument-size">{{ formatBytes(d.dateigroesse) }}</span>
                <button class="btn-link btn-download" (click)="downloadDokument(d)" title="Herunterladen">↓</button>
                <button class="btn-link btn-danger" (click)="deleteDokument(d.id)" title="Löschen">✕</button>
              </div>
              <div class="dokument-item dokument-item--pending" *ngFor="let s of stagedDokumente; let i = index">
                <span class="dokument-typ-badge">{{ s.dokumentTyp }}</span>
                <span class="dokument-name" [title]="s.file.name">{{ s.file.name }}</span>
                <span class="dokument-size">{{ formatBytes(s.file.size) }}</span>
                <span class="pending-label">ausstehend</span>
                <button class="btn-link btn-danger" (click)="removeStagedDokument(i)" title="Entfernen">✕</button>
              </div>
            </div>
            <p class="hint" *ngIf="!dokumente.length && !stagedDokumente.length">Keine Dokumente vorhanden.</p>

            <div class="upload-row">
              <select [(ngModel)]="newDokumentTyp" class="dokument-typ-select">
                <option *ngFor="let o of dokumentTypOptions" [value]="o.value">{{ o.label }}</option>
              </select>
              <label class="btn-upload">
                + Dokument hochladen
                <input type="file" style="display:none"
                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                       (change)="onFileSelected($event)" />
              </label>
            </div>
            <span class="field-error" *ngIf="dokumentUploadError">{{ dokumentUploadError }}</span>

          </div>

          <div class="modal-actions">
            <div class="dropdown">
              <button type="button" class="btn-export" (click)="exportMenuOpen = !exportMenuOpen">Export ▾</button>
              <div class="dropdown-menu" *ngIf="exportMenuOpen">
                <button type="button" (click)="exportKandidatdaten()">Export Kandidatdaten</button>
                <button type="button" (click)="exportKandidatdatenAnonymisiert()">Export Kandidatdaten anonymisiert</button>
                <button type="button" (click)="exportKandidatdatenPdf()">Export Kandidatdaten als PDF</button>
                <button type="button" (click)="exportKandidatdatenAnonymisiertPdf()">Export Kandidatdaten anonymisiert als PDF</button>
              </div>
            </div>
            <span class="import-status" *ngIf="exportStatus">{{ exportStatus }}</span>
            <button class="btn-match" *ngIf="editingId" [disabled]="kandidatKOError" (click)="openMatchSuchauftrag()">Match Suchauftrag</button>
            <button class="btn-save" [disabled]="!draft.allgemeinerSchwerpunkt" (click)="saveKandidat()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Match Suchauftrag Overlay -->
      <div class="modal-backdrop" *ngIf="matchModalOpen">
        <div [class]="(matchResultsOpen || suchauftragDetailOpen) ? 'modal-duo' : ''">

          <!-- Panel 1: Kriterien -->
          <div class="modal modal-kriterien">
            <h2>Match Suchauftrag – {{ draft.vorname }} {{ draft.nachname }}</h2>
            <div class="modal-body">

              <label>
                <span class="label-row">
                  Allgemeiner Schwerpunkt
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.allgemeinerSchwerpunktKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <select [(ngModel)]="draft.allgemeinerSchwerpunkt">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
                </select>
                <span class="field-error" *ngIf="koError(draft.allgemeinerSchwerpunkt, draft.allgemeinerSchwerpunktKOKriterium)">Allgemeiner Schwerpunkt ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Fachlicher Skill
                  <span class="ko-checkbox-group">
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="Mindestens ein" [ngModel]="draft.fachlicherSkillMindestensEin" (ngModelChange)="setExclusive(draft, 'fachlicherSkillMindestensEin', 'fachlicherSkillKOKriterium', $event)" />
                      Mindestens ein
                    </span>
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [ngModel]="draft.fachlicherSkillKOKriterium" (ngModelChange)="setExclusive(draft, 'fachlicherSkillKOKriterium', 'fachlicherSkillMindestensEin', $event)" />
                      KO Kriterium
                    </span>
                  </span>
                </span>
                <textarea rows="4" [(ngModel)]="draft.fachlicherSkill" placeholder="z.B. Java, SAP, CAD"></textarea>
                <span class="field-error" *ngIf="koError(draft.fachlicherSkill, draft.fachlicherSkillKOKriterium)">Fachlicher Skill ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Gehalt
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.gehaltKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <div class="input-suffix-wrapper">
                  <input [(ngModel)]="draft.gehalt" (input)="filterGehalt($event)" placeholder="z.B. 60000 oder 55000-70000" />
                  <span class="input-suffix">(Tausend €)</span>
                </div>
                <span class="field-error" *ngIf="koError(draft.gehalt, draft.gehaltKOKriterium)">Gehalt ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Berufserfahrung
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.berufserfahrungKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <input type="number" min="0" [(ngModel)]="draft.berufserfahrung" placeholder="z.B. 5" />
                <span class="field-error" *ngIf="koError(draft.berufserfahrung, draft.berufserfahrungKOKriterium)">Berufserfahrung ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Branchenkenntnisse
                  <span class="ko-checkbox-group">
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="Mindestens ein" [ngModel]="draft.branchenkenntnisseMindestensEin" (ngModelChange)="setExclusive(draft, 'branchenkenntnisseMindestensEin', 'branchenkenntnisseKOKriterium', $event)" />
                      Mindestens ein
                    </span>
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [ngModel]="draft.branchenkenntnisseKOKriterium" (ngModelChange)="setExclusive(draft, 'branchenkenntnisseKOKriterium', 'branchenkenntnisseMindestensEin', $event)" />
                      KO Kriterium
                    </span>
                  </span>
                </span>
                <textarea rows="4" [(ngModel)]="draft.branchenkenntnisse" placeholder="z.B. Automotive, IT"></textarea>
                <span class="field-error" *ngIf="koError(draft.branchenkenntnisse, draft.branchenkenntnisseKOKriterium)">Branchenkenntnisse ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Zertifikate
                  <span class="ko-checkbox-group">
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="Mindestens ein" [ngModel]="draft.zertifikateMindestensEin" (ngModelChange)="setExclusive(draft, 'zertifikateMindestensEin', 'zertifikateKOKriterium', $event)" />
                      Mindestens ein
                    </span>
                    <span class="ko-checkbox-label">
                      <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [ngModel]="draft.zertifikateKOKriterium" (ngModelChange)="setExclusive(draft, 'zertifikateKOKriterium', 'zertifikateMindestensEin', $event)" />
                      KO Kriterium
                    </span>
                  </span>
                </span>
                <input [(ngModel)]="draft.zertifikate" placeholder="z.B. AWS, PMP" />
                <span class="field-error" *ngIf="koError(draft.zertifikate, draft.zertifikateKOKriterium)">Zertifikate ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Deutsch
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.deutschKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <select [(ngModel)]="draft.deutsch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
                <span class="field-error" *ngIf="koError(draft.deutsch, draft.deutschKOKriterium)">Deutsch ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Englisch
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.englischKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <select [(ngModel)]="draft.englisch">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of sprachniveauOptions" [value]="o">{{ o }}</option>
                </select>
                <span class="field-error" *ngIf="koError(draft.englisch, draft.englischKOKriterium)">Englisch ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

              <label>
                <span class="label-row">
                  Sonstige Sprachen
                  <span class="ko-checkbox-label">
                    <input type="checkbox" class="ko-checkbox" title="KO Kriterium" [(ngModel)]="draft.sonstigeSprachenKOKriterium" />
                    KO Kriterium
                  </span>
                </span>
                <input [(ngModel)]="draft.sonstigeSprachen" placeholder="z.B. Französisch B2, Spanisch A2" />
                <span class="field-error" *ngIf="koError(draft.sonstigeSprachen, draft.sonstigeSprachenKOKriterium)">Sonstige Sprachen ist als KO-Kriterium markiert und darf nicht leer sein.</span>
              </label>

            </div>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="backFromMatch()">Zurück</button>
              <button class="btn-match" [disabled]="kandidatKOError" (click)="runMatchSuchauftrag()">Match Suchauftrag</button>
            </div>
          </div>

          <!-- Panel 2: Matched Suchaufträge -->
          <div class="modal modal-match" *ngIf="matchResultsOpen">
            <div class="match-header">
              <h2>Matched Suchaufträge</h2>
              <button class="close" (click)="matchResultsOpen = false; suchauftragDetailOpen = false">✕</button>
            </div>
            <p class="hint" *ngIf="matchedSuchauftraege.length" [title]="matchKriterienExplained">{{ matchKriterienExplained }}</p>
            <div *ngIf="!matchedSuchauftraege.length" class="empty">Keine Treffer gefunden.</div>
            <div class="match-list">
              <div class="match-card" *ngFor="let r of matchedSuchauftraege"
                   (dblclick)="openSuchauftragDetail(r.suchauftrag)"
                   [class.match-card-selected]="selectedSuchauftrag?.id === r.suchauftrag.id">
                <div class="card-title">
                  {{ r.suchauftrag.aktivitaet }}
                  <span class="match-score">{{ r.score }} / {{ matchMaxScore }}</span>
                </div>
                <div class="card-divider">Score Erklärung</div>
                <div class="card-row card-row-success" *ngIf="r.satisfiedKriterien"><span>Erfüllt:</span> {{ r.satisfiedKriterien }}</div>
                <div class="card-row card-row-danger" *ngIf="r.unsatisfiedKriterien"><span>Nicht erfüllt:</span> {{ r.unsatisfiedKriterien }}</div>
                <div class="card-divider">Suchauftragdaten</div>
                <div class="card-row" *ngIf="r.suchauftrag.allgemeinerSchwerpunkt"><span>Schwerpunkt:</span> {{ r.suchauftrag.allgemeinerSchwerpunkt }}</div>
                <div class="card-row" *ngIf="r.suchauftrag.ort"><span>Ort:</span> {{ r.suchauftrag.ort }}</div>
                <div class="card-row" *ngIf="r.suchauftrag.fachlicherSkill"><span>Fachlicher Skill:</span> {{ r.suchauftrag.fachlicherSkill }}</div>
                <div class="card-row" *ngIf="r.suchauftrag.berufserfahrung"><span>Berufserfahrung:</span> {{ r.suchauftrag.berufserfahrung }}</div>
                <div class="card-row" *ngIf="r.suchauftrag.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ r.suchauftrag.branchenkenntnisse }}</div>
              </div>
            </div>
          </div>

          <!-- Panel 3: read-only Suchauftrag detail -->
          <div class="modal modal-suchauftrag-detail" *ngIf="suchauftragDetailOpen && selectedSuchauftrag as s">
            <div class="match-header">
              <h2>{{ s.aktivitaet }}</h2>
              <button class="close" (click)="closeSuchauftragDetail()">✕</button>
            </div>
            <div class="modal-body">
              <div class="card-row" *ngIf="s.status"><span>Status:</span> {{ s.status }}</div>
              <div class="card-row" *ngIf="s.ort"><span>Ort:</span> {{ s.ort }}</div>
              <div class="card-row" *ngIf="s.postleitzahl"><span>PLZ:</span> {{ s.postleitzahl }}</div>
              <div class="card-row" *ngIf="s.adresse"><span>Adresse:</span> {{ s.adresse }}</div>
              <div class="card-row" *ngIf="s.allgemeinerSchwerpunkt"><span>Allgemeiner Schwerpunkt:</span> {{ s.allgemeinerSchwerpunkt }}</div>
              <div class="card-row" *ngIf="s.fachlicherSkill"><span>Fachlicher Skill:</span> {{ s.fachlicherSkill }}</div>
              <div class="card-row" *ngIf="s.gehaltMinimum || s.gehaltMaximum"><span>Gehalt:</span> {{ s.gehaltMinimum }}–{{ s.gehaltMaximum }} (Tausend €)</div>
              <div class="card-row" *ngIf="s.berufserfahrung"><span>Berufserfahrung:</span> {{ s.berufserfahrung }}</div>
              <div class="card-row" *ngIf="s.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ s.branchenkenntnisse }}</div>
              <div class="card-row" *ngIf="s.zertifikate"><span>Zertifikate:</span> {{ s.zertifikate }}</div>
              <div class="card-row" *ngIf="s.deutsch"><span>Deutsch:</span> {{ s.deutsch }}</div>
              <div class="card-row" *ngIf="s.englisch"><span>Englisch:</span> {{ s.englisch }}</div>
              <div class="card-row" *ngIf="s.sonstigeSprachen"><span>Sonstige Sprachen:</span> {{ s.sonstigeSprachen }}</div>
              <div class="card-row" *ngIf="s.informationen"><span>Informationen:</span> {{ s.informationen }}</div>
              <div class="card-row" *ngIf="s.anlageDatum"><span>Anlage Datum:</span> {{ s.anlageDatum }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    h1 { margin: 0; color: #1f2a44; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .checkbox-filter { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; white-space: nowrap; cursor: pointer; }
    .checkbox-filter input[type=checkbox] { cursor: pointer; accent-color: #3b5bdb; width: 15px; height: 15px; }
    .hint { color: #777; font-size: 13px; margin: 4px 0 16px; }
    .search-input {
      padding: 8px 12px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 14px; width: 280px;
    }
    .search-input:focus { outline: none; border-color: #3b5bdb; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .btn-add:hover { background: #2f4ac7; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    th { background: #f5f7fc; color: #1f2a44; font-size: 13px; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e9f3; white-space: nowrap; }
    td { padding: 10px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #f0f2f7; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafd; }
    tr.clickable { cursor: pointer; }
    .empty { text-align: center; color: #999; padding: 24px; }
    .doc-col { text-align: center; width: 60px; }
    .doc-col input[type=checkbox] { cursor: default; accent-color: #3b5bdb; width: 15px; height: 15px; }
    tr.row-dsgvo-expired td { background: #fdecea; }
    tr.row-dsgvo-expired:hover td { background: #fbdcd9; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal {
      background: white; border-radius: 10px; padding: 28px 28px 20px;
      width: 660px; max-width: 95vw; max-height: 88vh;
      display: flex; flex-direction: column;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .modal h2 { margin: 0 0 16px; color: #1f2a44; font-size: 18px; flex-shrink: 0; }
    .modal-body { overflow-y: auto; flex: 1; padding-right: 4px; }
    .section-title {
      font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase;
      letter-spacing: 0.05em; margin: 18px 0 10px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px;
    }
    .section-title:first-child { margin-top: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #555; margin-bottom: 12px; }
    input, select, textarea {
      padding: 7px 10px; border: 1px solid #dfe3ee; border-radius: 6px;
      font-size: 13px; background: white;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #3b5bdb; }
    textarea { resize: vertical; font-family: inherit; }
    .modal-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-top: 16px; flex-shrink: 0; }
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
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .input-with-btn { display: flex; gap: 6px; }
    .input-with-btn input { flex: 1; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .date-picker-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
    .input-suffix-wrapper { display: flex; align-items: stretch; border: 1px solid #dfe3ee; border-radius: 6px; overflow: hidden; }
    .input-suffix-wrapper:focus-within { border-color: #3b5bdb; }
    .input-suffix-wrapper input { flex: 1; border: none; outline: none; background: transparent; min-width: 0; }
    .input-suffix { display: flex; align-items: center; padding: 0 8px; background: #f1f3f8; color: #888; font-size: 12px; white-space: nowrap; border-left: 1px solid #dfe3ee; pointer-events: none; user-select: none; }
    .dokument-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .dokument-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: #f5f7fc; border-radius: 6px; border: 1px solid #e5e9f3; }
    .dokument-item--pending { border-style: dashed; background: #fafbff; }
    .dokument-typ-badge { font-size: 10px; font-weight: 700; color: #3b5bdb; background: #e8ecfa; border-radius: 4px; padding: 2px 6px; white-space: nowrap; flex-shrink: 0; }
    .dokument-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dokument-size { font-size: 11px; color: #888; white-space: nowrap; flex-shrink: 0; }
    .pending-label { font-size: 11px; color: #aaa; font-style: italic; white-space: nowrap; flex-shrink: 0; }
    .btn-download { padding: 8px 20px; }
    .btn-danger { color: #e03131; }
    .btn-danger:hover:not(:disabled) { background: #ffeaea; border-color: #e03131; }
    .upload-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; margin-bottom: 6px; }
    .dokument-typ-select { padding: 7px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 13px; background: white; }
    .btn-upload { display: inline-block; padding: 7px 14px; background: #f1f3f8; border: 1px dashed #3b5bdb; border-radius: 6px; font-size: 13px; color: #3b5bdb; cursor: pointer; white-space: nowrap; margin-bottom: 0; }
    .btn-upload:hover { background: #e8ecfa; }
    .interview-import-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 10px 14px; background: #f0f4ff; border: 1px solid #c5d0f5; border-radius: 8px; }
    .btn-interview-import { display: inline-block; padding: 7px 14px; background: #3b5bdb; color: white; border-radius: 6px; font-size: 13px; cursor: pointer; white-space: nowrap; margin: 0; }
    .btn-interview-import:hover { background: #2f4ac7; }
    .import-status { font-size: 12px; color: #3b5bdb; }

    /* Match Suchauftrag overlay */
    .btn-match { background: #2f9e44; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-match:hover { background: #258836; }
    .btn-match:disabled { background: #9dcfa9; cursor: not-allowed; }
    .close { background: transparent; border: 1px solid #dfe3ee; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .modal-duo { display: flex; gap: 20px; align-items: stretch; }
    .modal-kriterien { width: 460px; }
    .modal-match { width: 400px; flex-shrink: 0; }
    .modal-suchauftrag-detail { width: 540px; flex-shrink: 0; }
    .match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
    .match-header h2 { margin: 0; color: #1f2a44; font-size: 18px; }
    .match-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; }
    .match-card { background: #f8f9ff; border: 1px solid #e5e9f3; border-radius: 8px; padding: 12px; cursor: pointer; }
    .match-card:hover { border-color: #3b5bdb; }
    .match-card-selected { border-color: #3b5bdb; background: #eef2fb; }
    .card-title { font-weight: 600; margin-bottom: 8px; color: #1f2a44; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .match-score { font-size: 12px; font-weight: 700; color: #3b5bdb; background: #eef1fb; border-radius: 10px; padding: 2px 8px; }
    .card-divider { font-size: 11px; font-weight: 700; color: #8a90a2; text-transform: uppercase; letter-spacing: 0.04em; margin: 8px 0 4px; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .card-row-success, .card-row-success span:first-child { color: #1e7d32; }
    .card-row-danger, .card-row-danger span:first-child { color: #c92a2a; }
    .card-row-success, .card-row-danger { white-space: pre-line; }
    .label-row { display: flex; align-items: center; justify-content: space-between; }
    .label-row .ko-checkbox { margin: 0; }
    .ko-checkbox-label { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: normal; color: #8a90a2; }
    .ko-checkbox-group { display: flex; align-items: center; gap: 12px; }
  `]
})
export class KandidatenComponent implements OnInit {
  private service = inject(KandidatService);
  private dokumentService = inject(KandidatDokumentService);
  private xlsxImportService = inject(XlsxImportService);
  private exportService = inject(KandidatExportService);
  private matchService = inject(MatchSuchauftragService);

  items: Kandidat[] = [];
  searchText = '';
  onlyAbgelaufeneDsgvo = false;

  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;
  readonly sprachniveauOptions = SPRACHNIVEAU_OPTIONS;
  readonly fuehrerscheinOptions = FUEHRERSCHEIN_OPTIONS;
  readonly schwerpunktOptions = SCHWERPUNKT_OPTIONS;
  readonly dokumentTypOptions = DOKUMENT_TYP_OPTIONS;

  addModalOpen = false;
  editingId: string | null = null;
  draft: Partial<Kandidat> = {};
  kandidatErrors: Record<string, string> = {};

  dokumente: KandidatDokument[] = [];
  stagedDokumente: StagedDokument[] = [];
  newDokumentTyp: DokumentTyp | '' = 'CV';
  dokumentUploadError = '';
  importStatus = '';

  exportMenuOpen = false;
  exportStatus = '';

  // Match Suchauftrag overlay
  matchModalOpen = false;
  matchResultsOpen = false;
  matchedSuchauftraege: MatchSuchauftragResult[] = [];
  matchKriterienExplained = '';
  matchMaxScore = 0;
  suchauftragDetailOpen = false;
  selectedSuchauftrag: Suchauftrag | null = null;

  ngOnInit(): void { this.reload(); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.exportMenuOpen && !(event.target as HTMLElement).closest('.dropdown')) {
      this.exportMenuOpen = false;
    }
  }

  reload(): void {
    this.service.getAll().subscribe(list => (this.items = list));
  }

  get filtered(): Kandidat[] {
    const q = this.searchText.trim().toLowerCase();
    return this.items.filter(k => {
      if (q && !k.vorname?.toLowerCase().includes(q) && !k.nachname?.toLowerCase().includes(q)) return false;
      if (this.onlyAbgelaufeneDsgvo && !this.isDsgvoAbgelaufen(k)) return false;
      return true;
    });
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  openAddModal(): void {
    this.editingId = null;
    this.draft = { allgemeinerSchwerpunktKOKriterium: true };
    this.kandidatErrors = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
    this.importStatus = '';
    this.newDokumentTyp = 'CV';
    this.addModalOpen = true;
  }

  openEditModal(k: Kandidat): void {
    this.editingId = k.id ?? null;
    this.draft = { ...k, dsgvoBestaetigungsDatum: this.formatDsgvoDatum(k.dsgvoBestaetigungsDatum) };
    const mn = k.gehaltMinimum, mx = k.gehaltMaximum;
    this.draft.gehalt = mn != null && mx != null ? `${mn}-${mx}` : mn != null ? `${mn}` : mx != null ? `${mx}` : undefined;
    this.kandidatErrors = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
    this.importStatus = '';
    this.newDokumentTyp = 'CV';
    if (k.id) this.loadDokumente(k.id);
    this.addModalOpen = true;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.matchModalOpen) { this.closeMatchModal(); return; }
    if (this.addModalOpen) this.closeAddModal();
  }

  closeAddModal(): void {
    this.addModalOpen = false;
    this.editingId = null;
    this.draft = {};
    this.dokumente = [];
    this.stagedDokumente = [];
    this.dokumentUploadError = '';
    this.closeMatchModal();
  }

  // --- Match Suchauftrag ---

  private resetMatchState(): void {
    this.matchResultsOpen = false;
    this.matchedSuchauftraege = [];
    this.matchKriterienExplained = '';
    this.matchMaxScore = 0;
    this.suchauftragDetailOpen = false;
    this.selectedSuchauftrag = null;
  }

  closeMatchModal(): void {
    this.matchModalOpen = false;
    this.resetMatchState();
  }

  openMatchSuchauftrag(): void {
    this.resetMatchState();
    this.addModalOpen = false;
    this.matchModalOpen = true;
  }

  backFromMatch(): void {
    this.matchModalOpen = false;
    this.resetMatchState();
    this.addModalOpen = true;
  }

  runMatchSuchauftrag(): void {
    if (!this.editingId) return;
    this.normalizeDsgvoDatum();
    [this.draft.gehaltMinimum, this.draft.gehaltMaximum] = this.parseGehalt(this.draft.gehalt, 'kandidat');
    const payload = {
      ...this.draft,
      dsgvoBestaetigungsDatum: this.toBackendDsgvoDatum(this.draft.dsgvoBestaetigungsDatum),
    } as Kandidat;
    const id = this.editingId;
    this.service.update(id, payload).subscribe(() => {
      this.matchResultsOpen = true;
      this.matchService.matchSuchauftrag({ kandidatId: id }).subscribe(res => {
        this.matchKriterienExplained = res.kriterienExplained;
        this.matchMaxScore = res.maxScore;
        this.matchedSuchauftraege = res.results;
        if (res.results.length === 1) this.openSuchauftragDetail(res.results[0].suchauftrag);
      });
    });
  }

  openSuchauftragDetail(s: Suchauftrag): void {
    this.selectedSuchauftrag = s;
    this.suchauftragDetailOpen = true;
  }

  closeSuchauftragDetail(): void {
    this.suchauftragDetailOpen = false;
    this.selectedSuchauftrag = null;
  }

  setExclusive(target: any, changedField: string, otherField: string, value: boolean): void {
    target[changedField] = value;
    if (value) target[otherField] = false;
  }

  koError(value: string | number | undefined | null, checked: boolean | undefined): boolean {
    return !!checked && (value === undefined || value === null || value.toString().trim() === '');
  }

  get kandidatKOError(): boolean {
    const k = this.draft;
    return this.koError(k.allgemeinerSchwerpunkt, k.allgemeinerSchwerpunktKOKriterium)
      || this.koError(k.fachlicherSkill, k.fachlicherSkillKOKriterium)
      || this.koError(k.gehalt, k.gehaltKOKriterium)
      || this.koError(k.berufserfahrung, k.berufserfahrungKOKriterium)
      || this.koError(k.branchenkenntnisse, k.branchenkenntnisseKOKriterium)
      || this.koError(k.zertifikate, k.zertifikateKOKriterium)
      || this.koError(k.deutsch, k.deutschKOKriterium)
      || this.koError(k.englisch, k.englischKOKriterium)
      || this.koError(k.sonstigeSprachen, k.sonstigeSprachenKOKriterium);
  }

  filterGehalt(e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^0-9,\-]/g, '');
    this.draft.gehalt = el.value;
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

  saveKandidat(): void {
    this.normalizeDsgvoDatum();
    [this.draft.gehaltMinimum, this.draft.gehaltMaximum] = this.parseGehalt(this.draft.gehalt, 'kandidat');
    const payload: Kandidat = {
      ...this.draft,
      dsgvoBestaetigungsDatum: this.toBackendDsgvoDatum(this.draft.dsgvoBestaetigungsDatum),
    } as Kandidat;
    const onError = (err: any) => {
      if (err.status === 400) this.kandidatErrors = err.error ?? {};
    };
    if (this.editingId) {
      this.service.update(this.editingId, payload).subscribe({
        next: () => { this.reload(); this.closeAddModal(); },
        error: onError,
      });
    } else {
      this.service.create(payload).subscribe({
        next: (created) => {
          this.uploadStagedDokumente(created.id!, () => {
            this.reload();
            this.closeAddModal();
          });
        },
        error: onError,
      });
    }
  }

  private uploadStagedDokumente(kandidatId: string, onDone: () => void): void {
    console.log('[uploadStagedDokumente] kandidatId:', kandidatId, 'staged count:', this.stagedDokumente.length);
    if (!this.stagedDokumente.length) { onDone(); return; }
    const staged = [...this.stagedDokumente];
    let remaining = staged.length;
    staged.forEach(s => {
      this.dokumentService.upload(kandidatId, s.file, s.dokumentTyp).subscribe({
        next: () => { if (--remaining === 0) onDone(); },
        error: (err) => {
          const msg = err.error?.error ?? err.error?.message ?? err.statusText ?? 'Unbekannter Fehler';
          this.dokumentUploadError = `Upload von "${s.file.name}" fehlgeschlagen: ${msg}`;
          if (--remaining === 0) onDone();
        },
      });
    });
  }

  loadDokumente(kandidatId: string): void {
    this.dokumentService.list(kandidatId).subscribe({
      next: docs => this.dokumente = docs,
      error: () => this.dokumente = [],
    });
  }

  onInterviewImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const editingId = this.editingId;
    console.log('[Interview Import] editingId:', editingId, 'file:', file.name);
    this.importStatus = 'Wird importiert…';
    this.xlsxImportService.parseInterviewFile(file).then(parsed => {
      const filteredParsed = Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
      this.draft = { ...this.draft, ...filteredParsed };
      console.log('[Interview Import] editingId after parse:', editingId, 'stagedDocs:', this.stagedDokumente.length);
      if (editingId) {
        console.log('[Interview Import] Uploading directly for existing Kandidat...');
        this.dokumentService.upload(editingId, file, 'INTERVIEW').subscribe({
          next: doc => {
            this.dokumente = [...this.dokumente, doc];
            this.importStatus = 'Import und Speichern erfolgreich.';
            input.value = '';
            this.reload();
          },
          error: err => {
            const msg = err.error?.error ?? err.error?.message ?? err.statusText ?? 'Unbekannter Fehler';
            this.importStatus = 'Formular importiert, aber Speichern fehlgeschlagen: ' + msg;
            input.value = '';
          },
        });
      } else {
        this.stagedDokumente = [...this.stagedDokumente, { file, dokumentTyp: 'INTERVIEW' }];
        console.log('[Interview Import] Staged. Total staged:', this.stagedDokumente.length);
        this.importStatus = 'Import erfolgreich. Datei wird beim Speichern hochgeladen.';
        input.value = '';
      }
    }).catch(err => {
      console.error('Interview import error:', err);
      this.importStatus = 'Import fehlgeschlagen: ' + (err?.message ?? 'Unbekannter Fehler');
      input.value = '';
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.dokumentUploadError = '';

    if (this.editingId) {
      this.dokumentService.upload(this.editingId, file, this.newDokumentTyp).subscribe({
        next: doc => {
          this.dokumente = [...this.dokumente, doc];
          input.value = '';
          this.reload();
        },
        error: err => {
          this.dokumentUploadError = err.error?.error ?? 'Upload fehlgeschlagen.';
          input.value = '';
        },
      });
    } else {
      this.stagedDokumente = [...this.stagedDokumente, { file, dokumentTyp: this.newDokumentTyp }];
      input.value = '';
    }
  }

  removeStagedDokument(index: number): void {
    this.stagedDokumente = this.stagedDokumente.filter((_, i) => i !== index);
  }

  deleteDokument(docId: string): void {
    if (!this.editingId) return;
    this.dokumentService.delete(this.editingId, docId).subscribe({
      next: () => { this.dokumente = this.dokumente.filter(d => d.id !== docId); this.reload(); },
    });
  }

  downloadDokument(doc: KandidatDokument): void {
    if (!this.editingId) return;
    this.dokumentService.downloadUrl(this.editingId, doc.id).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
    });
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  isDsgvoAbgelaufen(k: Kandidat): boolean {
    const raw = k.dsgvoBestaetigungsDatum;
    if (!raw) return false;
    const match = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (!match) return false;
    const [, day, month, year] = match;
    const date = new Date(+year, +month - 1, +day);
    if (isNaN(date.getTime())) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  }

  normalizeDsgvoDatum(): void {
    if (this.draft.dsgvoBestaetigungsDatum) {
      this.draft.dsgvoBestaetigungsDatum = this.draft.dsgvoBestaetigungsDatum.replace(/\//g, '.');
    }
  }

  openDsgvoDatePicker(picker: HTMLInputElement): void {
    const iso = this.toIsoDate(this.draft.dsgvoBestaetigungsDatum);
    picker.value = iso ?? '';
    if (typeof (picker as any).showPicker === 'function') {
      try {
        (picker as any).showPicker();
        return;
      } catch {
        // fall through to click()
      }
    }
    picker.click();
  }

  onDsgvoDatePicked(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    const [year, month, day] = value.split('-');
    this.draft.dsgvoBestaetigungsDatum = `${day}.${month}.${year}`;
  }

  formatDsgvoDatum(value?: string): string | undefined {
    return value ? value.replace(/\//g, '.') : undefined;
  }

  private toBackendDsgvoDatum(value?: string): string | undefined {
    return value ? value.replace(/\./g, '/') : undefined;
  }

  private toIsoDate(value?: string): string | null {
    if (!value) return null;
    const match = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private copyExportToClipboard(anonymisiert: boolean): void {
    this.exportService.copyToClipboard(this.draft, anonymisiert).then(() => {
      this.exportStatus = 'In Zwischenablage kopiert.';
      setTimeout(() => (this.exportStatus = ''), 2500);
    });
    this.exportMenuOpen = false;
  }

  exportKandidatdaten(): void {
    this.copyExportToClipboard(false);
  }

  exportKandidatdatenAnonymisiert(): void {
    this.copyExportToClipboard(true);
  }

  private exportAsPdf(anonymisiert: boolean): void {
    this.exportService.exportAsPdf(this.draft, anonymisiert).then(() => {
      this.exportStatus = 'PDF erstellt.';
      setTimeout(() => (this.exportStatus = ''), 2500);
    });
    this.exportMenuOpen = false;
  }

  exportKandidatdatenPdf(): void {
    this.exportAsPdf(false);
  }

  exportKandidatdatenAnonymisiertPdf(): void {
    this.exportAsPdf(true);
  }
}