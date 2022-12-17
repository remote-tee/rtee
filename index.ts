import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as destinationCmd from "./lib/cmd/destination";
import * as pipe from "./lib/cmd/pipe";
import * as pluginCmd from "./lib/cmd/plugin";

let program = yargs(hideBin(process.argv))
  .wrap(Math.min(100, yargs.terminalWidth()))
  .showHelpOnFail(true)
  .demandCommand(1, "")
  .recommendCommands();

program.command('plugin', "Manage plugins", pluginCmd.init);
program.command(["destination", "dest", "d"], "Manage destinations", destinationCmd.init);
pipe.init(program);

program.parse();