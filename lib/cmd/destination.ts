import chalk from 'chalk';
import fs from 'fs';
import _ from "lodash";
import path from 'path';
import { exit } from 'process';
import yargs from "yargs";
import pluginMap from "../../data/plugin-map.json";
import { DATA_DIR, DATA_FILE } from '../const';
import { PluginMap } from "../plugin-map/types";
import { loadPlugin } from "../plugin-map/util";
import { LocalFileStorage } from '../plugins/storage';

const add = (program: yargs.Argv) => {
  program
    .demandCommand(1, "")
    .option('name', {
      description: 'Unique name for this destination',
    });

  let map = pluginMap as PluginMap;

  _.forEach(map, (v, k) => {
    program.command(k, v.schema.description || "", (dest) => {
      _.forEach(v.schema.properties, (prop, propName) => {
        dest.option(_.kebabCase(propName), {
          description: "description" in prop ? prop.description : undefined,
          type: prop.type,
          demandOption: v.schema.required.includes(propName),
        });

      });
    }, async (argv) => {
      let args = _.pick(argv, _.keys(v.schema.properties));
      let name = argv.name as string || `${k.replace("/", '-')}-${_.random(0xAAAAAA, 0xFFFFFF).toString(16)}`;
      let dir = path.join(DATA_DIR, name);

      if (fs.existsSync(dir)) {
        console.error(chalk.red('Destination', chalk.bold(name), 'already exists.'))
        exit(1);
      }

      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, DATA_FILE), JSON.stringify({ args, plugin: k }));

      // Plugins can perform one-time initialization in `init` (say by writing to `Storage`)
      // as well as per-run initialization.
      let plugin = await loadPlugin(v.path);
      await plugin.init(args, new LocalFileStorage(name));

      console.log(chalk.green('Destination', chalk.bold(name), 'created!'))
    });
  });
};

export function init(program: yargs.Argv) {
  program.demandCommand(1, "");
  program.command("add", "Add a destination", add);
}
