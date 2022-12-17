import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import * as Handlebars from "handlebars";
import * as plugin from '../types';

const region = "us-east-1";
const subject = `rtee: new data available`;
const htmlBody = `<h1>You have new data from rtee</h1><pre>{{raw}}</pre>`;
const textBody = `New data from rtee: {{raw}}`;

export const description = `Send email via Amazon SES.`;

export interface Context extends plugin.Context {
  client: SESv2Client;
  html: HandlebarsTemplateDelegate;
  text: HandlebarsTemplateDelegate;
}

export interface Args extends plugin.Args {
  /**
   * Testing this feature
   */
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;

  from: string;
  to: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
}

export function init(args: Args): Destination {
  args.subject ||= subject;
  args.htmlBody ||= htmlBody;
  args.textBody ||= textBody;
  args.region ||= region;

  let client = new SESv2Client({
    region,
    credentials: {
      accessKeyId: args.accessKeyId,
      secretAccessKey: args.secretAccessKey,
    },
  });

  let html = Handlebars.compile(args.htmlBody);
  let text = Handlebars.compile(args.textBody);

  return new Destination({ client, html, text }, args);
}

class Destination extends plugin.Destination {
  context: Context;
  args: Args;

  constructor(context: Context, args: Args) {
    super();
    this.context = context;
    this.args = args;
  }

  async send(raw: string) {
    let data = { raw };

    let command = new SendEmailCommand({
      FromEmailAddress: this.args.from,
      Destination: { ToAddresses: [this.args.to] },
      Content: {
        Simple: {
          Subject: { Data: this.args.subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: this.context.text(data), Charset: "UTF-8" },
            Html: { Data: this.context.html(data), Charset: "UTF-8" },
          },
        },
      },
    });

    await this.context.client.send(command);
  }
}
