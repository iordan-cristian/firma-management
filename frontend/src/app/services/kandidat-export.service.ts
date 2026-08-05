import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Geschlecht, Kandidat } from '../models/kandidat.model';

@Injectable({ providedIn: 'root' })
export class KandidatExportService {

  buildExportText(k: Partial<Kandidat>, anonymisiert: boolean): string {
    const lines: string[] = [];
    const push = (label: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return;
      lines.push(`${label}: ${value}`);
    };

    if (anonymisiert) {
      const vInitial = k.vorname?.trim().charAt(0);
      const nInitial = k.nachname?.trim().charAt(0);
      lines.push([vInitial ? `${vInitial}.` : '', nInitial ? `${nInitial}.` : ''].filter(Boolean).join(' '));
    } else {
      lines.push([this.anrede(k.geschlecht), k.titel, k.vorname, k.nachname].filter(Boolean).join(' '));
    }
    lines.push('');

    lines.push('Berufliche Anforderungen');
    push('Wochenstunden', k.wochenstunden);
    push('Gehalt', this.gehaltExportDisplay(k));
    push('Wochenendbereitschaft', k.wochenendbereitschaft);
    push('Homeoffice', k.homeoffice);
    push('Firmenwagenregelung', k.firmenwagenregelung);
    push('Reisetätigkeiten mit Übernachtung', k.reisetaetigkeitenMitUebernachtung);
    push('Tägliche Fahrzeit (Min.)', k.taeglicheFahrzeit);
    lines.push('');

    lines.push('Sprachkenntnisse');
    push('Deutsch', k.deutsch);
    push('Englisch', k.englisch);
    push('Sonstige Sprachen', k.sonstigeSprachen);
    lines.push('');

    lines.push('Berufserfahrung');
    push('Allgemeiner Schwerpunkt', k.allgemeinerSchwerpunkt);
    push('Fachlicher Skill', k.fachlicherSkill);
    push('Branchenkenntnisse', k.branchenkenntnisse);
    push('Berufserfahrung', k.berufserfahrung != null ? `${k.berufserfahrung} Jahre` : undefined);
    push('Aktuelle Tätigkeiten', k.aktuelleTaetigkeiten);
    push('Aktuelle Position', k.aktuellePosition);
    lines.push('');

    lines.push('Wechsel & Zukunft');
    push('Wechselgründe', k.wechselgruende);
    push('Zukünftige Position / Tätigkeiten', k.zukuenftigePositionTaetigkeiten);
    push('Kündigungsfrist', k.kuendigungsfrist);

    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
  }

  async copyToClipboard(k: Partial<Kandidat>, anonymisiert: boolean): Promise<void> {
    const text = this.buildExportText(k, anonymisiert);
    await navigator.clipboard.writeText(text);
  }

  async exportAsPdf(k: Partial<Kandidat>, anonymisiert: boolean): Promise<void> {
    const text = this.buildExportText(k, anonymisiert);
    const doc = new jsPDF();
    const marginX = 15;
    const marginY = 20;
    const lineHeight = 6;
    const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = marginY;
    for (const rawLine of text.split('\n')) {
      const wrapped = doc.splitTextToSize(rawLine, maxWidth);
      for (const line of wrapped) {
        if (y > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        doc.text(line, marginX, y);
        y += lineHeight;
      }
    }

    const blob = doc.output('blob');
    const filename = this.buildFilename(k, anonymisiert);
    await this.saveBlob(blob, filename);
  }

  private buildFilename(k: Partial<Kandidat>, anonymisiert: boolean): string {
    const suffix = anonymisiert ? 'anonymisiert' : '';
    const namePart = anonymisiert
      ? [k.vorname?.trim().charAt(0), k.nachname?.trim().charAt(0)].filter(Boolean).join('')
      : [k.vorname, k.nachname].filter(Boolean).join('_');
    return ['Kandidatdaten', namePart, suffix].filter(Boolean).join('_') + '.pdf';
  }

  private async saveBlob(blob: Blob, filename: string): Promise<void> {
    const picker = (window as any).showSaveFilePicker;
    if (picker) {
      try {
        const handle = await picker({
          suggestedName: filename,
          types: [{ description: 'PDF-Datei', accept: { 'application/pdf': ['.pdf'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private anrede(geschlecht?: Geschlecht): string {
    if (geschlecht === 'männlich') return 'Herr';
    if (geschlecht === 'weiblich') return 'Frau';
    return '';
  }

  private gehaltExportDisplay(k: Partial<Kandidat>): string | undefined {
    const min = k.gehaltMinimum, max = k.gehaltMaximum;
    if (min != null && max != null) return `${min}-${max} Tausend €`;
    if (min != null) return `${min} Tausend €`;
    if (max != null) return `${max} Tausend €`;
    return undefined;
  }
}
