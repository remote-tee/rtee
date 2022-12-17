import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import _ from 'lodash';
import { stdin as input } from 'node:process';
import * as readline from 'node:readline/promises';
import path from "path";
import { exit } from "process";
import yargs from "yargs";
import { DATA_DIR, DATA_FILE } from "../const";
import { loadPlugin } from "../plugin-map/util";



/**
 * Create a yargs subcommand for each destination in `DATA_DIR`
 */
export function init(program: yargs.Argv) {
  // Default catch-all command: https://github.com/yargs/yargs/blob/main/docs/advanced.md#default-commands
  program.command("$0", '', _.identity, async (argv) => {
    if (argv._.length !== 1) {
      program.showHelp();
      return;
    }

    let destinationLabels = (argv._[0] as string).split('+');

    let destinations = await Promise.all(destinationLabels.map(async (dl) => {
      let filename = path.join(DATA_DIR, dl, DATA_FILE);

      if (!existsSync(filename)) {
        console.log(chalk.red(`Can't find destination ${chalk.bold(dl)}.`))
        exit(1);
      }

      let { plugin: pluginName, args } = JSON.parse(readFileSync(filename, 'utf-8'));
      let plugin = await loadPlugin(`lib/plugins/${pluginName}`);
      return plugin.init(args);
    }));

    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      for (let destination of destinations) {
        destination.send(line);
      }
    });
  });
}