import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export interface ProgressRow {
  patternName: string;
  status: string;
  problemsSolved: number;
  totalProblems: number;
  notes: string;
}

// Writes progress rows to the user's Google Sheet (range: Sheet1!A2:E)
export async function syncProgressToSheet(
  spreadsheetId: string,
  rows: ProgressRow[]
): Promise<void> {
  const header = [["Pattern", "Status", "Solved", "Total", "Notes"]];
  const values = rows.map((r) => [
    r.patternName,
    r.status,
    r.problemsSolved,
    r.totalProblems,
    r.notes,
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values: [...header, ...values] },
  });
}

export async function readProgressFromSheet(
  spreadsheetId: string
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A2:E",
  });
  return (res.data.values as string[][]) ?? [];
}
