import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../services/firma.service';
import { AnsprechpartnerService } from '../../services/ansprechpartner.service';
import { SuchauftragService } from '../../services/suchauftrag.service';
import { VertragService } from '../../services/vertrag.service';
import { KandidatService } from '../../services/kandidat.service';
import { Firma, SCHWERPUNKT_OPTIONS } from '../../models/firma.model';
import { Ansprechpartner } from '../../models/ansprechpartner.model';
import { Suchauftrag, AKTIVITAET_OPTIONS, STATUS_OPTIONS } from '../../models/suchauftrag.model';
import { Vertrag } from '../../models/vertrag.model';
import { Kandidat, GESCHLECHT_OPTIONS, TITEL_OPTIONS, SPRACHNIVEAU_OPTIONS, FUEHRERSCHEIN_OPTIONS } from '../../models/kandidat.model';

type DetailMode = 'ansprechpartner' | 'suchauftraege' | 'vertraege';

@Component({
  selector: 'app-firmen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Firmen</h1>
        <button class="btn-add" (click)="openAddModal()">+ Firma</button>
      </div>
      <p class="hint">Right-click a row to view related data.</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Standort</th>
              <th>Allgemeiner Schwerpunkt</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Mobil</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let f of firmen">
              <tr (contextmenu)="openMenu($event, f)"
                  (dblclick)="openEditFirma(f)"
                  [class.selected]="expandedFirma?.id === f.id">
                <td>{{ f.name }}</td>
                <td>{{ f.standort }}</td>
                <td>{{ f.allgemeinerSchwerpunkt }}</td>
                <td>{{ f.email }}</td>
                <td>{{ f.telefon }}</td>
                <td>{{ f.mobil }}</td>
              </tr>
              <tr *ngIf="expandedFirma?.id === f.id && detailMode" class="detail-row">
                <td colspan="6">
                  <div class="inline-detail">
                    <div class="inline-detail-header">
                      <strong>{{ detailTitle }}</strong>
                      <div class="header-actions">
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'ansprechpartner'" (click)="openAddAnsprechpartner()">+ Ansprechpartner</button>
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'suchauftraege'" (click)="openAddSuchauftrag()">+ Suchauftrag</button>
                        <button class="btn-add-small"
                          *ngIf="detailMode === 'vertraege'" (click)="openAddVertrag()">+ Vertrag</button>
                        <button class="close" (click)="closeDetail()">✕</button>
                      </div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'ansprechpartner'">
                      <div class="card" *ngFor="let a of ansprechpartnerList" (dblclick)="openEditAnsprechpartner(a)">
                        <div class="card-title">{{ a.vorname }} {{ a.nachname }}</div>
                        <div class="card-row"><span>Position:</span> {{ a.position }}</div>
                        <div class="card-row"><span>Schwerpunkt:</span> {{ a.schwerpunkt }}</div>
                        <div class="card-row"><span>E-Mail:</span> {{ a.email }}</div>
                        <div class="card-row"><span>Telefon:</span> {{ a.telefonnummer }}</div>
                        <div class="card-row"><span>Kontaktinterval:</span> {{ a.kontaktinterval }}</div>
                        <div class="card-row" *ngIf="a.linkedinProfil"><span>LinkedIn:</span> <a [href]="a.linkedinProfil" target="_blank" rel="noopener noreferrer" class="profile-link">{{ a.linkedinProfil }}</a></div>
                        <div class="card-row" *ngIf="a.xingProfil"><span>Xing:</span> <a [href]="a.xingProfil" target="_blank" rel="noopener noreferrer" class="profile-link">{{ a.xingProfil }}</a></div>
                        <div class="card-info" *ngIf="a.informationen">{{ a.informationen }}</div>
                      </div>
                      <div *ngIf="!ansprechpartnerList.length" class="empty">No Ansprechpartner.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'suchauftraege'">
                      <div class="card" *ngFor="let s of suchauftragList" (dblclick)="openEditSuchauftrag(s)">
                        <div class="card-title">{{ s.aktivitaet }}</div>
                        <div class="card-row"><span>Status:</span>
                          <span class="badge" [class.done]="s.status === 'Fertig'">{{ s.status }}</span>
                        </div>
                        <div class="card-row" *ngIf="s.postleitzahl || s.ort"><span>Ort:</span> {{ s.postleitzahl }} {{ s.ort }}</div>
                        <div class="card-row" *ngIf="s.adresse"><span>Adresse:</span> {{ s.adresse }}</div>
                        <div class="card-row" *ngIf="s.fachlicherSkill"><span>Fachlicher Skill:</span> {{ s.fachlicherSkill }}</div>
                        <div class="card-row" *ngIf="s.gehalt"><span>Gehalt:</span> {{ s.gehalt }}</div>
                        <div class="card-row" *ngIf="s.gehaltMehrInfo"><span>Gehalt Info:</span> {{ s.gehaltMehrInfo }}</div>
                        <div class="card-row" *ngIf="s.berufserfahrung"><span>Berufserfahrung:</span> {{ s.berufserfahrung }}</div>
                        <div class="card-row" *ngIf="s.branchenkenntnisse"><span>Branchenkenntnisse:</span> {{ s.branchenkenntnisse }}</div>
                        <div class="card-row" *ngIf="s.zertifikate"><span>Zertifikate:</span> {{ s.zertifikate }}</div>
                        <div class="card-row" *ngIf="s.deutsch"><span>Deutsch:</span> {{ s.deutsch }}</div>
                        <div class="card-row" *ngIf="s.englisch"><span>Englisch:</span> {{ s.englisch }}</div>
                        <div class="card-row" *ngIf="s.sonstigeSprachen"><span>Sonstige Sprachen:</span> {{ s.sonstigeSprachen }}</div>
                        <div class="card-info" *ngIf="s.informationen">{{ s.informationen }}</div>
                        <div class="card-row" *ngIf="s.anlageDatum"><span>Anlage Datum:</span> {{ s.anlageDatum }}</div>
                      </div>
                      <div *ngIf="!suchauftragList.length" class="empty">No Suchaufträge.</div>
                    </div>

                    <div class="cards" *ngIf="detailMode === 'vertraege'">
                      <div class="card" *ngFor="let v of vertragList" (dblclick)="openEditVertrag(v)">
                        <div class="card-title">Vertrag</div>
                        <div class="card-row"><span>Wert:</span> {{ v.wert | number:'1.2-2' }} €</div>
                        <div class="card-row"><span>Bezahlbar am:</span> {{ v.bezahlbarAm }}</div>
                        <div class="card-row"><span>Bezahlt:</span>
                          <span class="badge" [class.done]="v.bezahlt">{{ v.bezahlt ? 'Ja' : 'Nein' }}</span>
                        </div>
                      </div>
                      <div *ngIf="!vertragList.length" class="empty">No Verträge.</div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="!firmen.length"><td colspan="6" class="empty">No Firmen yet.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Custom right-click context menu -->
      <div class="ctx-menu"
           *ngIf="menuOpen"
           [style.top.px]="menuY"
           [style.left.px]="menuX"
           (click)="$event.stopPropagation()">
        <button (click)="loadDetail('ansprechpartner')">Ansprechpartner</button>
        <button (click)="loadDetail('suchauftraege')">Suchaufträge</button>
        <button (click)="loadDetail('vertraege')">Verträge</button>
      </div>

      <!-- Add Firma Modal -->
      <div class="modal-backdrop" *ngIf="addFirmaOpen">
        <div class="modal">
          <h2>{{ editingFirmaId ? 'Firma bearbeiten' : 'Neue Firma' }}</h2>
          <label>Name
            <input [(ngModel)]="draftFirma.name" placeholder="Firmenname" />
          </label>
          <label>Standort
            <input [(ngModel)]="draftFirma.standort" placeholder="Standort" />
          </label>
          <label>Allgemeiner Schwerpunkt
            <select [(ngModel)]="draftFirma.allgemeinerSchwerpunkt">
              <option value="" disabled>— auswählen —</option>
              <option *ngFor="let s of schwerpunktOptions" [value]="s">{{ s }}</option>
            </select>
          </label>
          <label>E-Mail
            <div class="input-with-btn">
              <input type="email" [(ngModel)]="draftFirma.email" placeholder="info@beispiel.de" />
              <button class="btn-link" (click)="copyToClipboard(draftFirma.email)" [disabled]="!draftFirma.email">📋</button>
            </div>
            <span class="field-error" *ngIf="firmaErrors['email']">{{ firmaErrors['email'] }}</span>
          </label>
          <label>Telefon
            <div class="input-with-btn">
              <input [(ngModel)]="draftFirma.telefon" placeholder="+49 30 1234567" />
              <button class="btn-link" (click)="copyToClipboard(draftFirma.telefon)" [disabled]="!draftFirma.telefon">📋</button>
            </div>
            <span class="field-error" *ngIf="firmaErrors['telefon']">{{ firmaErrors['telefon'] }}</span>
          </label>
          <label>Mobil
            <div class="input-with-btn">
              <input [(ngModel)]="draftFirma.mobil" placeholder="+49 170 1234567" />
              <button class="btn-link" (click)="copyToClipboard(draftFirma.mobil)" [disabled]="!draftFirma.mobil">📋</button>
            </div>
            <span class="field-error" *ngIf="firmaErrors['mobil']">{{ firmaErrors['mobil'] }}</span>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveFirma()">Speichern</button>
            <button class="btn-cancel" (click)="closeAddModal()">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add Ansprechpartner Modal -->
      <div class="modal-backdrop" *ngIf="addAnsprechpartnerOpen">
        <div class="modal modal-wide">
          <h2>{{ editingAnsprechpartnerId ? 'Ansprechpartner bearbeiten' : 'Neuer Ansprechpartner' }}</h2>
          <div class="section-title">Persönliche Daten</div>
          <label>Vorname
            <input [(ngModel)]="draftAnsprechpartner.vorname" placeholder="Vorname" />
          </label>
          <label>Nachname
            <input [(ngModel)]="draftAnsprechpartner.nachname" placeholder="Nachname" />
          </label>
          <label>Position
            <input [(ngModel)]="draftAnsprechpartner.position" placeholder="Position" />
          </label>
          <label>Schwerpunkt
            <input [(ngModel)]="draftAnsprechpartner.schwerpunkt" placeholder="Schwerpunkt" />
          </label>
          <div class="section-title">Kontakt</div>
          <label>E-Mail
            <div class="input-with-btn">
              <input [(ngModel)]="draftAnsprechpartner.email" placeholder="E-Mail" />
              <button class="btn-link" (click)="copyToClipboard(draftAnsprechpartner.email)" [disabled]="!draftAnsprechpartner.email">📋</button>
            </div>
            <span class="field-error" *ngIf="ansprechpartnerErrors['email']">{{ ansprechpartnerErrors['email'] }}</span>
          </label>
          <label>Telefon
            <div class="input-with-btn">
              <input [(ngModel)]="draftAnsprechpartner.telefonnummer" placeholder="Telefonnummer" />
              <button class="btn-link" (click)="copyToClipboard(draftAnsprechpartner.telefonnummer)" [disabled]="!draftAnsprechpartner.telefonnummer">📋</button>
            </div>
            <span class="field-error" *ngIf="ansprechpartnerErrors['telefonnummer']">{{ ansprechpartnerErrors['telefonnummer'] }}</span>
          </label>
          <label>Kontaktinterval
            <input [(ngModel)]="draftAnsprechpartner.kontaktinterval" placeholder="z.B. wöchentlich" />
          </label>
          <div class="section-title">Social Media</div>
          <label>LinkedIn Profil
            <div class="input-with-btn">
              <input [(ngModel)]="draftAnsprechpartner.linkedinProfil" placeholder="LinkedIn-URL" />
              <button class="btn-link" (click)="openLink(draftAnsprechpartner.linkedinProfil)" [disabled]="!draftAnsprechpartner.linkedinProfil">↗</button>
            </div>
          </label>
          <label>Xing Profil
            <div class="input-with-btn">
              <input [(ngModel)]="draftAnsprechpartner.xingProfil" placeholder="Xing-URL" />
              <button class="btn-link" (click)="openLink(draftAnsprechpartner.xingProfil)" [disabled]="!draftAnsprechpartner.xingProfil">↗</button>
            </div>
          </label>
          <div class="section-title">Informationen</div>
          <label>Informationen
            <textarea [(ngModel)]="draftAnsprechpartner.informationen" placeholder="Notizen..." rows="8" style="min-height:160px"></textarea>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveAnsprechpartner()">Speichern</button>
            <button class="btn-cancel" (click)="addAnsprechpartnerOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>

      <!-- Add Suchauftrag Modal -->
      <div class="modal-backdrop" *ngIf="addSuchauftragOpen">
        <div [class]="matchedKandidatenOpen ? 'modal-duo' : ''">
          <div class="modal modal-suchauftrag">
            <h2>{{ editingSuchauftragId ? 'Suchauftrag der ' + expandedFirma?.name + ' bearbeiten' : 'Neuer Suchauftrag für ' + expandedFirma?.name }}</h2>
            <div class="modal-form-content">
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
              
              <div class="section-title">Arbeitsplatz</div>
              <label>Ort
                <input [(ngModel)]="draftSuchauftrag.ort" placeholder="Ort" />
              </label>
              <label>Postleitzahl
                <input [(ngModel)]="draftSuchauftrag.postleitzahl" placeholder="PLZ" />
              </label>
              <label>Adresse
                <input [(ngModel)]="draftSuchauftrag.adresse" placeholder="Straße und Hausnummer" />
              </label>
              
               <div class="section-title">Kandidat</div>
              <label>Fachlicher Skill
                <textarea rows="4" [(ngModel)]="draftSuchauftrag.fachlicherSkill" placeholder="z.B. Java, SAP, CAD"></textarea>
              </label>
              <label>Gehalt
                <div class="input-suffix-wrapper">
                  <input [(ngModel)]="draftSuchauftrag.gehalt" (input)="filterGehalt($event, 'suchauftrag')" placeholder="z.B. 60000-80000" />
                  <span class="input-suffix">(Tausend €)</span>
                </div>
              </label>
              <label>Gehalt Mehr Info
                <input [(ngModel)]="draftSuchauftrag.gehaltMehrInfo" placeholder="z.B. Bonus, Nebenleistungen" />
              </label>
              <label>Berufserfahrung
                <input [(ngModel)]="draftSuchauftrag.berufserfahrung" placeholder="z.B. 5+ Jahre" />
              </label>
              <label>Branchenkenntnisse
                <textarea rows="4" [(ngModel)]="draftSuchauftrag.branchenkenntnisse" placeholder="z.B. Automotive, IT"></textarea>
              </label>
              <label>Zertifikate
                <input [(ngModel)]="draftSuchauftrag.zertifikate" placeholder="z.B. PMP, ISO 9001" />
              </label>
              <label>Deutsch
                <input [(ngModel)]="draftSuchauftrag.deutsch" placeholder="z.B. C1, Muttersprache" />
              </label>
              <label>Englisch
                <input [(ngModel)]="draftSuchauftrag.englisch" placeholder="z.B. B2, fließend" />
              </label>
              <label>Sonstige Sprachen
                <input [(ngModel)]="draftSuchauftrag.sonstigeSprachen" placeholder="z.B. Französisch B2, Spanisch A2" />
              </label>
              <label>Informationen
                <textarea [(ngModel)]="draftSuchauftrag.informationen" placeholder="Notizen..." rows="8" style="min-height:160px"></textarea>
              </label>
            </div>
            <div class="modal-actions">
              <button class="btn-save" (click)="saveSuchauftrag()">Speichern</button>
              <button class="btn-match" (click)="openMatchedKandidaten()">Match option</button>
              <button class="btn-cancel" (click)="closeSuchauftragModal()">Abbrechen</button>
            </div>
          </div>

          <!-- Matched Kandidaten panel -->
          <div class="modal modal-match" *ngIf="matchedKandidatenOpen">
            <div class="match-header">
              <h2>Matched Kandidaten</h2>
              <button class="close" (click)="matchedKandidatenOpen = false; kandidatDetailOpen = false">✕</button>
            </div>
            <div *ngIf="!matchedKandidaten.length" class="empty">Keine Treffer gefunden.</div>
            <div class="match-list">
              <div class="match-card" *ngFor="let k of matchedKandidaten"
                   (dblclick)="openKandidatDetail(k)"
                   [class.match-card-selected]="selectedKandidat?.id === k.id">
                <div class="card-title">{{ k.vorname }} {{ k.nachname }}</div>
                <div class="card-row" *ngIf="k.aktuellePosition"><span>Position:</span> {{ k.aktuellePosition }}</div>
                <div class="card-row" *ngIf="k.ort"><span>Ort:</span> {{ k.ort }}</div>
                <div class="card-row" *ngIf="k.gehalt"><span>Gehalt:</span> {{ k.gehalt }}</div>
                <div class="card-row" *ngIf="k.branchenkenntnisse"><span>Branche:</span> {{ k.branchenkenntnisse }}</div>
                <div class="card-row" *ngIf="k.zertifikate"><span>Zertifikate:</span> {{ k.zertifikate }}</div>
                <div class="card-row" *ngIf="k.allgemeinerSchwerpunkt"><span>Schwerpunkt:</span> {{ k.allgemeinerSchwerpunkt }}</div>
                <div class="card-row" *ngIf="k.fachlicherSkill"><span>Fachlicher Skill:</span> {{ k.fachlicherSkill }}</div>
              </div>
            </div>
          </div>

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
              <label>Allgemeiner Schwerpunkt
                <select [(ngModel)]="draftKandidat.allgemeinerSchwerpunkt">
                  <option [ngValue]="undefined">–</option>
                  <option *ngFor="let o of schwerpunktOptions" [value]="o">{{ o }}</option>
                </select>
              </label>
              <label>Fachlicher Skill <textarea rows="4" [(ngModel)]="draftKandidat.fachlicherSkill" placeholder="Fachlicher Skill"></textarea></label>
              <label>Branchenkenntnisse <textarea rows="4" [(ngModel)]="draftKandidat.branchenkenntnisse"></textarea></label>
              <label>Aktuelle Tätigkeiten <input [(ngModel)]="draftKandidat.aktuelleTaetigkeiten" /></label>
              <label>Aktuelle Position <input [(ngModel)]="draftKandidat.aktuellePosition" /></label>

              <div class="k-section">Wechsel &amp; Zukunft</div>
              <label>Wechselgründe <input [(ngModel)]="draftKandidat.wechselgruende" /></label>
              <label>Zukünftige Position <input [(ngModel)]="draftKandidat.zukuenftigePositionTaetigkeiten" /></label>
              <div class="form-row">
                <label>Kündigungsfrist <input [(ngModel)]="draftKandidat.kuendigungsfrist" /></label>
                <label>Erstes Online-Meeting <input [(ngModel)]="draftKandidat.erstesOnlineMeeting" /></label>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-save" (click)="saveKandidatDetail()">Speichern</button>
              <button class="btn-cancel" (click)="kandidatDetailOpen = false">Abbrechen</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Vertrag Modal -->
      <div class="modal-backdrop" *ngIf="addVertragOpen">
        <div class="modal">
          <h2>{{ editingVertragId ? 'Vertrag bearbeiten' : 'Neuer Vertrag' }}</h2>
          <label>Ansprechpartner ID *
            <input [(ngModel)]="draftVertrag.ansprechpartnerId" placeholder="UUID" />
          </label>
          <label>Suchauftrag ID
            <input [(ngModel)]="draftVertrag.suchauftragId" placeholder="UUID (optional)" />
          </label>
          <label>Wert (€)
            <input type="number" [(ngModel)]="draftVertrag.wert" placeholder="0.00" step="0.01" />
          </label>
          <label>Bezahlbar am
            <input type="date" [(ngModel)]="bezahlbarAmInput" />
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="draftVertrag.bezahlt" />
            <span>Bezahlt</span>
          </label>
          <div class="modal-actions">
            <button class="btn-save" (click)="saveVertrag()">Speichern</button>
            <button class="btn-cancel" (click)="addVertragOpen = false">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { '(document:click)': 'closeMenu()' },
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .page-header h1 { margin: 0; color: #1f2a44; }
    .hint { color: #777; margin: 0 0 16px; font-size: 13px; }
    .btn-add { background: #3b5bdb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .btn-add:hover { background: #2f4ac7; }

    .table-wrap { background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 14px; text-align: left; font-size: 14px; }
    th { background: #f1f3f8; color: #1f2a44; font-weight: 600; border-bottom: 1px solid #dfe3ee; }
    tbody tr { border-top: 1px solid #f0f1f5; cursor: context-menu; }
    tbody tr:hover { background: #fafbff; }
    tbody tr.selected { background: #eef2fb; }
    tbody tr.detail-row { cursor: default; background: #f4f7ff; border-top: none; }
    tbody tr.detail-row:hover { background: #f4f7ff; }
    .empty { color: #999; text-align: center; padding: 18px; }

    .inline-detail { padding: 16px; }
    .inline-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .inline-detail-header strong { font-size: 15px; color: #1f2a44; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .btn-add-small { background: #3b5bdb; color: white; border: none; padding: 5px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-add-small:hover { background: #2f4ac7; }

    .ctx-menu {
      position: fixed; background: white; border: 1px solid #dfe3ee; border-radius: 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      min-width: 180px; z-index: 1000; overflow: hidden;
    }
    .ctx-menu button { background: white; border: none; text-align: left; padding: 10px 14px; font-size: 14px; cursor: pointer; }
    .ctx-menu button:hover { background: #eef2fb; }

    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; max-height: 300px; overflow-y: auto; }
    .card { background: white; border: 1px solid #e5e9f3; border-radius: 8px; padding: 14px; cursor: pointer; }
    .card:hover { border-color: #3b5bdb; }
    .card-title { font-weight: 600; margin-bottom: 8px; color: #1f2a44; }
    .card-row { font-size: 13px; margin: 4px 0; color: #333; }
    .card-row span:first-child { color: #777; margin-right: 4px; }
    .card-info { margin-top: 8px; font-size: 12px; color: #555; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #f5d97c; font-size: 12px; }
    .badge.done { background: #b6e3b6; }
    .profile-link { color: #3b5bdb; text-decoration: none; font-size: 13px; word-break: break-all; }
    .profile-link:hover { text-decoration: underline; }
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
    .modal label.checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
    .modal input:not([type="checkbox"]), .modal select, .modal textarea {
      padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    .modal input:not([type="checkbox"]):focus, .modal select:focus, .modal textarea:focus {
      outline: none; border-color: #3b5bdb;
    }
    .modal textarea { resize: vertical; }
    .modal.modal-wide { width: 640px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
    .btn-save { background: #3b5bdb; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-save:hover { background: #2f4ac7; }
    .btn-match { background: #2f9e44; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .btn-match:hover { background: #258836; }
    .btn-cancel { background: transparent; border: 1px solid #dfe3ee; padding: 8px 18px; border-radius: 6px; cursor: pointer; }
    .input-with-btn { display: flex; gap: 6px; }
    .input-with-btn input { flex: 1; }
    .btn-link { padding: 8px 10px; border: 1px solid #dfe3ee; border-radius: 6px; background: #f1f3f8; cursor: pointer; font-size: 14px; line-height: 1; }
    .btn-link:hover:not(:disabled) { background: #e2e6f0; }
    .btn-link:disabled { opacity: 0.4; cursor: default; }
    .field-error { color: #e03131; font-size: 11px; margin-top: 2px; }
    .input-suffix-wrapper { display: flex; align-items: stretch; border: 1px solid #dfe3ee; border-radius: 6px; overflow: hidden; }
    .input-suffix-wrapper:focus-within { border-color: #3b5bdb; }
    .modal .input-suffix-wrapper input { flex: 1; border: none; outline: none; background: transparent; min-width: 0; }
    .input-suffix { display: flex; align-items: center; padding: 0 8px; background: #f1f3f8; color: #888; font-size: 12px; white-space: nowrap; border-left: 1px solid #dfe3ee; pointer-events: none; user-select: none; }

    .modal-duo { display: flex; gap: 20px; align-items: stretch; }
    .modal-suchauftrag { display: flex; flex-direction: column; overflow: hidden; }
    .modal-form-content { overflow-y: auto; flex: 1; }
    .modal-match { width: 400px; flex-shrink: 0; display: flex; flex-direction: column; }
    .match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .match-header h2 { margin: 0; color: #1f2a44; font-size: 18px; }
    .match-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; }
    .match-card { background: #f8f9ff; border: 1px solid #e5e9f3; border-radius: 8px; padding: 12px; cursor: pointer; }
    .match-card:hover { border-color: #3b5bdb; }
    .match-card-selected { border-color: #3b5bdb; background: #eef2fb; }
    .modal-kandidat-detail { width: 540px; flex-shrink: 0; display: flex; flex-direction: column; }
    .k-section { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; letter-spacing: 0.05em; margin: 16px 0 8px; border-bottom: 1px solid #e5e9f3; padding-bottom: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  `]
})
export class FirmenComponent implements OnInit {
  private firmaService = inject(FirmaService);
  private ansprechpartnerService = inject(AnsprechpartnerService);
  private suchauftragService = inject(SuchauftragService);
  private vertragService = inject(VertragService);
  private kandidatService = inject(KandidatService);

  firmen: Firma[] = [];
  selectedFirma: Firma | null = null;
  expandedFirma: Firma | null = null;

  menuOpen = false;
  menuX = 0;
  menuY = 0;

  detailMode: DetailMode | null = null;
  detailTitle = '';
  ansprechpartnerList: Ansprechpartner[] = [];
  suchauftragList: Suchauftrag[] = [];
  vertragList: Vertrag[] = [];

  readonly schwerpunktOptions = SCHWERPUNKT_OPTIONS;
  readonly aktivitaetOptions = AKTIVITAET_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly geschlechtOptions = GESCHLECHT_OPTIONS;
  readonly titelOptions = TITEL_OPTIONS;
  readonly sprachniveauOptions = SPRACHNIVEAU_OPTIONS;
  readonly fuehrerscheinOptions = FUEHRERSCHEIN_OPTIONS;

  // Add / Edit Firma
  addFirmaOpen = false;
  editingFirmaId: string | null = null;
  draftFirma: Partial<Firma> = {};
  firmaErrors: Record<string, string> = {};

  // Add / Edit Ansprechpartner
  addAnsprechpartnerOpen = false;
  editingAnsprechpartnerId: string | null = null;
  draftAnsprechpartner: Partial<Ansprechpartner> = {};
  ansprechpartnerErrors: Record<string, string> = {};

  // Add / Edit Suchauftrag
  addSuchauftragOpen = false;
  editingSuchauftragId: string | null = null;
  draftSuchauftrag: Partial<Suchauftrag> = {};
  anlageDatumInput = '';
  matchedKandidatenOpen = false;
  matchedKandidaten: Kandidat[] = [];
  kandidatDetailOpen = false;
  selectedKandidat: Kandidat | null = null;
  draftKandidat: Partial<Kandidat> = {};

  // Add / Edit Vertrag
  addVertragOpen = false;
  editingVertragId: string | null = null;
  draftVertrag: Partial<Vertrag> = {};
  bezahlbarAmInput = '';

  ngOnInit(): void {
    this.firmaService.getAll().subscribe(list => (this.firmen = list));
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyToClipboard(value?: string): void {
    if (value) navigator.clipboard.writeText(value);
  }

  // ── Firma ────────────────────────────────────────────────
  openAddModal(): void { this.editingFirmaId = null; this.draftFirma = {}; this.firmaErrors = {}; this.addFirmaOpen = true; }
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.addFirmaOpen) this.closeAddModal();
    else if (this.addAnsprechpartnerOpen) this.addAnsprechpartnerOpen = false;
    else if (this.addSuchauftragOpen) this.closeSuchauftragModal();
    else if (this.addVertragOpen) this.addVertragOpen = false;
  }

  closeAddModal(): void { this.addFirmaOpen = false; }

  openEditFirma(f: Firma): void {
    this.editingFirmaId = f.id ?? null;
    this.draftFirma = { ...f };
    this.firmaErrors = {};
    this.addFirmaOpen = true;
  }

  saveFirma(): void {
    const onError = (err: any) => {
      if (err.status === 400) this.firmaErrors = err.error ?? {};
    };
    if (this.editingFirmaId) {
      this.firmaService.update(this.editingFirmaId, this.draftFirma as Firma).subscribe({
        next: updated => { this.firmen = this.firmen.map(f => f.id === updated.id ? updated : f); this.closeAddModal(); },
        error: onError,
      });
    } else {
      this.firmaService.create(this.draftFirma as Firma).subscribe({
        next: created => { this.firmen = [...this.firmen, created]; this.closeAddModal(); },
        error: onError,
      });
    }
  }

  // ── Ansprechpartner ──────────────────────────────────────
  openAddAnsprechpartner(): void {
    this.editingAnsprechpartnerId = null;
    this.draftAnsprechpartner = { firmaId: this.expandedFirma!.id };
    this.ansprechpartnerErrors = {};
    this.addAnsprechpartnerOpen = true;
  }

  openEditAnsprechpartner(a: Ansprechpartner): void {
    this.editingAnsprechpartnerId = a.id ?? null;
    this.draftAnsprechpartner = { ...a };
    this.ansprechpartnerErrors = {};
    this.addAnsprechpartnerOpen = true;
  }

  saveAnsprechpartner(): void {
    const refresh = () =>
      this.firmaService.getAnsprechpartnerForFirma(this.expandedFirma!.id!).subscribe(list => (this.ansprechpartnerList = list));
    const onError = (err: any) => {
      if (err.status === 400) this.ansprechpartnerErrors = err.error ?? {};
    };
    if (this.editingAnsprechpartnerId) {
      this.ansprechpartnerService.update(this.editingAnsprechpartnerId, this.draftAnsprechpartner as Ansprechpartner).subscribe({
        next: () => { refresh(); this.addAnsprechpartnerOpen = false; this.editingAnsprechpartnerId = null; },
        error: onError,
      });
    } else {
      this.ansprechpartnerService.create(this.draftAnsprechpartner as Ansprechpartner).subscribe({
        next: () => { refresh(); this.addAnsprechpartnerOpen = false; },
        error: onError,
      });
    }
  }

  // ── Suchauftrag ──────────────────────────────────────────
  openAddSuchauftrag(): void {
    this.editingSuchauftragId = null;
    this.draftSuchauftrag = { aktivitaet: 'Personal', status: 'in Arbeit' };
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.anlageDatumInput = `${now.getFullYear()}-${m}-${d}`;
    this.ensureAnsprechpartnerLoaded(() => (this.addSuchauftragOpen = true));
  }

  openEditSuchauftrag(s: Suchauftrag): void {
    this.editingSuchauftragId = s.id ?? null;
    this.draftSuchauftrag = { ...s };
    if (s.anlageDatum) {
      const [d, m, y] = s.anlageDatum.split('/');
      this.anlageDatumInput = `${y}-${m}-${d}`;
    } else {
      this.anlageDatumInput = '';
    }
    this.ensureAnsprechpartnerLoaded(() => (this.addSuchauftragOpen = true));
  }

  private ensureAnsprechpartnerLoaded(then: () => void): void {
    if (this.ansprechpartnerList.length > 0) { then(); return; }
    this.firmaService.getAnsprechpartnerForFirma(this.expandedFirma!.id!).subscribe(list => {
      this.ansprechpartnerList = list;
      then();
    });
  }

  closeSuchauftragModal(): void {
    this.addSuchauftragOpen = false;
    this.matchedKandidatenOpen = false;
    this.matchedKandidaten = [];
    this.kandidatDetailOpen = false;
    this.selectedKandidat = null;
    this.draftKandidat = {};
  }

  openMatchedKandidaten(): void {
    this.matchedKandidatenOpen = true;
    this.kandidatService.getAll().subscribe(list => (this.matchedKandidaten = list));
  }

  openKandidatDetail(k: Kandidat): void {
    this.selectedKandidat = k;
    this.draftKandidat = { ...k };
    this.kandidatDetailOpen = true;
  }

  saveKandidatDetail(): void {
    if (!this.selectedKandidat?.id) return;
    this.kandidatService.update(this.selectedKandidat.id, this.draftKandidat as Kandidat).subscribe(updated => {
      this.matchedKandidaten = this.matchedKandidaten.map(k => k.id === updated.id ? updated : k);
      this.kandidatDetailOpen = false;
      this.selectedKandidat = null;
    });
  }

  saveSuchauftrag(): void {
    if (!this.draftSuchauftrag.ansprechpartnerId) return;
    if (this.anlageDatumInput) {
      const [y, m, d] = this.anlageDatumInput.split('-');
      this.draftSuchauftrag.anlageDatum = `${d}/${m}/${y}`;
    } else {
      this.draftSuchauftrag.anlageDatum = undefined;
    }
    const refresh = () =>
      this.firmaService.getSuchauftragForFirma(this.expandedFirma!.id!).subscribe(list => (this.suchauftragList = list));
    if (this.editingSuchauftragId) {
      this.suchauftragService.update(this.editingSuchauftragId, this.draftSuchauftrag as Suchauftrag).subscribe(() => {
        refresh(); this.closeSuchauftragModal(); this.editingSuchauftragId = null;
      });
    } else {
      this.suchauftragService.create(this.draftSuchauftrag as Suchauftrag).subscribe(() => {
        refresh(); this.closeSuchauftragModal();
      });
    }
  }

  filterGehalt(e: Event, target: 'suchauftrag' | 'kandidat'): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^0-9,\-]/g, '');
    if (target === 'suchauftrag') this.draftSuchauftrag.gehalt = el.value;
    else this.draftKandidat.gehalt = el.value;
  }

  // ── Vertrag ──────────────────────────────────────────────
  openAddVertrag(): void {
    this.editingVertragId = null;
    this.draftVertrag = { firmaId: this.expandedFirma!.id, bezahlt: false };
    this.bezahlbarAmInput = '';
    this.addVertragOpen = true;
  }

  openEditVertrag(v: Vertrag): void {
    this.editingVertragId = v.id ?? null;
    this.draftVertrag = { ...v };
    if (v.bezahlbarAm) {
      const [d, m, y] = v.bezahlbarAm.split('/');
      this.bezahlbarAmInput = `${y}-${m}-${d}`;
    } else {
      this.bezahlbarAmInput = '';
    }
    this.addVertragOpen = true;
  }

  saveVertrag(): void {
    if (!this.draftVertrag.ansprechpartnerId) return;
    if (this.bezahlbarAmInput) {
      const [y, m, d] = this.bezahlbarAmInput.split('-');
      this.draftVertrag.bezahlbarAm = `${d}/${m}/${y}`;
    }
    const refresh = () =>
      this.firmaService.getVertragForFirma(this.expandedFirma!.id!).subscribe(list => (this.vertragList = list));
    if (this.editingVertragId) {
      this.vertragService.update(this.editingVertragId, this.draftVertrag as Vertrag).subscribe(() => {
        refresh(); this.addVertragOpen = false; this.editingVertragId = null;
      });
    } else {
      this.vertragService.create(this.draftVertrag as Vertrag).subscribe(() => {
        refresh(); this.addVertragOpen = false;
      });
    }
  }

  // ── Context menu & detail ────────────────────────────────
  openMenu(event: MouseEvent, firma: Firma): void {
    event.preventDefault();
    this.selectedFirma = firma;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuOpen = true;
  }

  closeMenu(): void { this.menuOpen = false; }

  loadDetail(mode: DetailMode): void {
    this.menuOpen = false;
    if (!this.selectedFirma?.id) return;
    this.expandedFirma = this.selectedFirma;
    const id = this.expandedFirma.id!;

    this.ansprechpartnerList = [];
    this.suchauftragList = [];
    this.vertragList = [];

    this.detailMode = mode;
    if (mode === 'ansprechpartner') {
      this.detailTitle = `Ansprechpartner — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
      this.firmaService.getAnsprechpartnerForFirma(id).subscribe(list => (this.ansprechpartnerList = list));
    } else if (mode === 'suchauftraege') {
      this.detailTitle = `Suchaufträge — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
      this.firmaService.getSuchauftragForFirma(id).subscribe(list => (this.suchauftragList = list));
    } else if (mode === 'vertraege') {
      this.detailTitle = `Verträge — ${this.expandedFirma.name ?? this.expandedFirma.standort ?? ''}`;
      this.firmaService.getVertragForFirma(id).subscribe(list => (this.vertragList = list));
    }
  }

  closeDetail(): void {
    this.expandedFirma = null;
    this.detailMode = null;
    this.ansprechpartnerList = [];
    this.suchauftragList = [];
    this.vertragList = [];
  }
}