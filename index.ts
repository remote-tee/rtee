import * as ses from "./lib/plugins/ses/send";
import * as destinationCmd from "./lib/cmd/destination";
import * as pluginCmd from "./lib/cmd/plugin";
import { Command } from "commander";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

let program = yargs(hideBin(process.argv))
  .showHelpOnFail(true)
  .demandCommand(1, "")
  .recommendCommands();

program.command("plugin", "plugins", pluginCmd.init);
program.command("destination", "destinations", destinationCmd.init);

program.parse();

// destinationCmd.init(program);
// pluginCmd.init(program);

// (async () => {
//   let args: ses.Args = {
//     accessKeyId: '<secret>',
//     secretAccessKey: '<secret>',
//     from: 'Test Form <notifications@email.formulate.dev>',
//     to: 'tim@formulate.dev',
//   }

//   let destination = ses.init(args);
//   // await destination.send("New data coming in! Fresh off the presses!");
// })()
