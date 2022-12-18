import { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import inquirer from 'inquirer';
import { Storage } from "../storage";
import * as plugin from '../types';

/**
 * TODO:
 * 
 * 1. PKCE
 * 2. Don't reveal OAuth keys in the source code, use GH actions/secrets
 * 3. Instructions when `authorizeUrl` is printed
 * 4. Upgrade OAuth credentials to production credentials
 * 5. Webpage that logs `code` + update redirect_uri
 */

export interface Context extends plugin.Context {
  client: OAuth2Client;
}

export interface Args extends plugin.Args {
  projectId?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;

  /**
   * The ID of the spreadsheet you're appending to.
   */
  spreadsheetId: string;
}

export async function init(args: Args, storage: Storage): Promise<Destination> {
  let client = new OAuth2Client({
    clientId: args.clientId || '<secret>',
    clientSecret: args.clientSecret || '<secret>',
    redirectUri: args.redirectUri || 'https://example.com/callback',
  })

  let rawCredentials = storage.get('credentials');
  let credentials: Credentials;

  if (rawCredentials) {
    credentials = JSON.parse(rawCredentials);
  } else {
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    });

    console.log(authorizeUrl);
    let answers = await inquirer.prompt([{
      type: 'input',
      name: 'code',
      message: 'Enter auth code:',
    }]);

    let r = await client.getToken(answers.code);
    storage.set('credentials', JSON.stringify(r.tokens));
    credentials = r.tokens;
  }

  client.setCredentials(credentials);

  return new Destination({ client }, args);
}

/**
 * Append a row to a Google Sheets spreadsheet.
 */
class Destination extends plugin.Destination {
  context: Context;
  args: Args;

  constructor(context: Context, args: Args) {
    super();
    this.context = context;
    this.args = args;
  }

  async send(raw: string) {
    const sheets = google.sheets({ version: 'v4', auth: this.context.client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.args.spreadsheetId,
      range: 'A:A',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        majorDimension: "ROWS",
        values: [
          [raw]
        ]
      }
    });
  }
}
