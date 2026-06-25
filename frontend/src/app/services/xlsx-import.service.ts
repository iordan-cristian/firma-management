import { Injectable } from '@angular/core';
import { read, utils } from 'xlsx';
import { Kandidat, Sprachniveau, Fuehrerschein, Geschlecht, Titel, SPRACHNIVEAU_OPTIONS } from '../models/kandidat.model';

@Injectable({ providedIn: 'root' })
export class XlsxImportService {

  async parseInterviewFile(file: File): Promise<Partial<Kandidat>> {
    const buffer = await file.arrayBuffer();
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = (utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' }) as any[][])
      .map(row => row.map(cell => (cell == null ? '' : String(cell))));
    return this.mapRows(rows);
  }

  private mapRows(rows: string[][]): Partial<Kandidat> {
    const result: Partial<Kandidat> = {};

    // --- "Interview mit:" → geschlecht, titel, vorname, nachname ---
    const interviewMit = this.findNextCellInRow(rows, 'Interview mit');
    if (interviewMit) {
      Object.assign(result, this.parseInterviewMit(interviewMit));
    }

    // --- PLZ and Ort are in the same row ---
    const plzOrtRow = this.findRow(rows, 'PLZ');
    if (plzOrtRow) {
      const plz = this.nextCellAfterLabel(plzOrtRow, 'PLZ');
      const ort = this.nextCellAfterLabel(plzOrtRow, 'Ort');
      const plzNum = parseInt(plz ?? '', 10);
      if (!isNaN(plzNum)) result.postleitzahl = plzNum;
      if (ort) result.ort = ort;
    }

    // --- Simple label → next cell in same row mappings ---
    const geburtsjahr = this.findNextCellInRow(rows, 'Geburtsjahr');
    if (geburtsjahr) {
      const n = parseInt(geburtsjahr, 10);
      if (!isNaN(n)) result.geburtsjahr = n;
    }

    result.staatsangehoerigkeit = this.findNextCellInRow(rows, 'Staatsangehörigkeit') || undefined;
    result.familienstand        = this.findNextCellInRow(rows, 'Familienstand') || undefined;
    result.kinder               = this.findNextCellInRow(rows, 'Kinder') || undefined;
    result.wochenstunden        = this.findNextCellInRow(rows, 'Wochenstunden') || undefined;
    result.wochenendbereitschaft = this.findNextCellInRow(rows, 'Wochenendbereitschaft') || undefined;
    result.homeoffice           = this.findNextCellInRow(rows, 'Homeoffice') || undefined;
    result.firmenwagenregelung  = this.findNextCellInRow(rows, 'Firmenwagenregelung') || undefined;
    result.reisetaetigkeitenMitUebernachtung = this.findNextCellInRow(rows, 'Reisetätigkeiten') || undefined;
    result.hochschulabschluss   = this.findNextCellInRow(rows, 'Hochschulabschluss') || undefined;
    result.berufsausbildung     = this.findNextCellInRow(rows, 'Berufsausbildung') || undefined;
    result.sonstigeSprachen     = this.findNextCellInRow(rows, 'Sonstige Sprachen') || undefined;
    result.zertifikate          = this.findNextCellInRow(rows, 'fachspezifische Zertifikate') || undefined;

    // --- Sprachniveau ---
    const deutsch  = this.findNextCellInRow(rows, 'Deutsch:');
    const englisch = this.findNextCellInRow(rows, 'Englisch:');
    result.deutsch  = this.toSprachniveau(deutsch);
    result.englisch = this.toSprachniveau(englisch);

    // --- Fuehrerschein ---
    const fuehrerschein = this.findNextCellInRow(rows, 'Autoführerschein');
    result.autofuehrerschein = this.toFuehrerschein(fuehrerschein);

    // --- Gehalt ---
    const gehaltRaw = this.findNextCellInRow(rows, 'Gehaltsrange');
    if (gehaltRaw) {
      result.gehalt = this.parseGehaltText(gehaltRaw);
    }

    // --- Tägliche Fahrzeit (Q5) ---
    const fahrzeitAnswer = this.findAnswerAfterQuestion(rows, 'Fahrzeit');
    if (fahrzeitAnswer) {
      const match = fahrzeitAnswer.match(/\d+/);
      if (match) result.taeglicheFahrzeit = parseInt(match[0], 10);
    }

    // --- Branchenkenntnisse (Q6) ---
    result.branchenkenntnisse = this.findAnswerAfterQuestion(rows, 'Branchenkenntnisse') || undefined;

    // --- Wechselgründe + Aktuelle Tätigkeiten (Q7) ---
    const q7Block = this.findCellContaining(rows, 'Wechselgrund');
    if (q7Block) {
      const [wechsel, taetig] = this.splitQ7Block(q7Block);
      if (wechsel) result.wechselgruende     = wechsel;
      if (taetig)  result.aktuelleTaetigkeiten = taetig;
    }

    // --- Zukünftige Position (Q8) ---
    result.zukuenftigePositionTaetigkeiten = this.findAnswerAfterQuestion(rows, 'Zukunft') || undefined;

    // --- Kündigungsfrist (Q9) ---
    result.kuendigungsfrist = this.findAnswerAfterQuestion(rows, 'Kündigungsfrist') || undefined;

    // --- Erstes Online-Meeting (Q10) ---
    result.erstesOnlineMeeting = this.findAnswerAfterQuestion(rows, 'Online-Meeting') || undefined;

    return result;
  }

  // --- Helpers ---

  private findRow(rows: string[][], keyword: string): string[] | null {
    const kw = keyword.toLowerCase();
    return rows.find(row => row.some(cell => cell.toLowerCase().includes(kw))) ?? null;
  }

  private nextCellAfterLabel(row: string[], label: string): string | null {
    const lw = label.toLowerCase();
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i].toLowerCase().includes(lw)) {
        for (let j = i + 1; j < row.length; j++) {
          const v = row[j].trim();
          if (v) return v;
        }
      }
    }
    return null;
  }

  private findNextCellInRow(rows: string[][], label: string): string | null {
    const row = this.findRow(rows, label);
    if (!row) return null;
    return this.nextCellAfterLabel(row, label);
  }

  private findAnswerAfterQuestion(rows: string[][], questionKeyword: string): string | null {
    const kw = questionKeyword.toLowerCase();
    let questionIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].some(cell => cell.toLowerCase().includes(kw))) {
        questionIdx = i;
        break;
      }
    }
    if (questionIdx === -1) return null;

    // Scan up to 8 rows after the question for "Antwort:" + value
    for (let i = questionIdx + 1; i < Math.min(questionIdx + 8, rows.length); i++) {
      const row = rows[i];
      for (let j = 0; j < row.length; j++) {
        if (row[j].trim().toLowerCase().startsWith('antwort')) {
          const val = this.nextCellAfterLabel(row, 'antwort');
          if (val) return val;
        }
      }
    }
    return null;
  }

  private findCellContaining(rows: string[][], keyword: string): string | null {
    const kw = keyword.toLowerCase();
    for (const row of rows) {
      for (const cell of row) {
        if (cell.toLowerCase().includes(kw)) return cell;
      }
    }
    return null;
  }

  private parseInterviewMit(text: string): Partial<Kandidat> {
    const result: Partial<Kandidat> = {};
    let tokens = text.trim().split(/\s+/).filter(Boolean);

    if (tokens[0]?.toLowerCase() === 'frau') {
      result.geschlecht = 'weiblich' as Geschlecht;
      tokens = tokens.slice(1);
    } else if (tokens[0]?.toLowerCase() === 'herr') {
      result.geschlecht = 'männlich' as Geschlecht;
      tokens = tokens.slice(1);
    }

    if (tokens[0] === 'Dr.') {
      result.titel = 'Dr.' as Titel;
      tokens = tokens.slice(1);
    } else if (tokens[0] === 'Ing.') {
      result.titel = 'Ing.' as Titel;
      tokens = tokens.slice(1);
    }

    if (tokens.length >= 2) {
      result.vorname  = tokens[0];
      result.nachname = tokens[tokens.length - 1];
    } else if (tokens.length === 1) {
      result.nachname = tokens[0];
    }

    return result;
  }

  private parseGehaltText(raw: string): string {
    // Take only the part before any parenthesis
    const beforeParen = raw.split('(')[0];
    // Remove € and German thousands dots, then normalize dashes
    return beforeParen
      .replace(/€/g, '')
      .replace(/\./g, '')
      .replace(/\s*[-–]\s*/g, '-')
      .trim();
  }

  private splitQ7Block(block: string): [string, string] {
    const taetigIdx = block.search(/T[äa]tigkeit:/i);
    if (taetigIdx === -1) return [block.trim(), ''];
    return [
      block.slice(0, taetigIdx).replace(/^Wechselgrund:\s*/i, '').trim(),
      block.slice(taetigIdx).replace(/^T[äa]tigkeit:\s*/i, '').trim(),
    ];
  }

  private toSprachniveau(raw: string | null): Sprachniveau | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    return (SPRACHNIVEAU_OPTIONS as string[]).includes(trimmed)
      ? (trimmed as Sprachniveau)
      : undefined;
  }

  private toFuehrerschein(raw: string | null): Fuehrerschein | undefined {
    if (!raw) return undefined;
    return raw.trim().toLowerCase().includes('vorhanden') && !raw.toLowerCase().includes('nicht')
      ? 'vorhanden'
      : raw.trim() === '-'
        ? undefined
        : 'nicht vorhanden';
  }
}
