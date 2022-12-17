import { Command } from "commander";
import _ from "lodash";
import yargs from "yargs";
import pluginMap from '../../data/plugin-map.json';

export function init(program: yargs.Argv) {
  program.command('list', 'List all plugins', () => {
    _.forEach(pluginMap, (v, k) => {
      if (v.description) {
        console.log(k, ' – ', v.description);
      } else {
        console.log(k);
      }
    })
  });
}