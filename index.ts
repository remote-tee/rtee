import * as ses from "./plugins/ses/send"

(async () => {
  let args: ses.Args = {
    accessKeyId: '<secret>',
    secretAccessKey: '<secret>',
    from: 'Test Form <notifications@email.formulate.dev>',
    to: 'tim@formulate.dev',
  }

  let destination = ses.init(args);
  await destination.send("New data coming in! Fresh off the presses!");
})()