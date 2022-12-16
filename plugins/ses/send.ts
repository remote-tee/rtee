import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import _ from "lodash";
import * as Handlebars from "handlebars";

const region = "us-east-1";
const subject = ``;
const htmlBody = ``;
const textBody = ``;

export interface Context {
  client: SESv2Client;
  html: HandlebarsTemplateDelegate;
  text: HandlebarsTemplateDelegate;
}

export interface Args {
  /**
   * Hostname for the target SMTP server
   */
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;

  // Templating
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

class Destination {
  context: Context;
  args: Args;
  
  constructor(context: Context, args: Args) {
    this.context = context;
    this.args = args;
  }

  async send(data: object | string) {
    data = _.isString(data) ? { raw: data } : data;

    let command = new SendEmailCommand({
      FromEmailAddress: this.args.from,
      Destination: { ToAddresses: [this.args.to], },
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
