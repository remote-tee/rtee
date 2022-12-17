import yargs from "yargs";
import _ from "lodash";
import { PluginMap } from "../plugin-map/types";
import pluginMap from "../../data/plugin-map.json";

const add = (program: yargs.Argv) => {
  program.demandCommand(1, "");

  let map = pluginMap as PluginMap;

  _.forEach(map, (v, k) => {
    let description = v.description?.split("\n")[0];
    program.command(k, description || "", (dest) => {
      _.forEach(v.properties, (prop, propName) => {
        dest.option(_.kebabCase(propName), {
          description: "description" in prop ? prop.description : undefined,
          type: prop.type,
          demandOption: v.required.includes(propName),
        });
      });
    });
  });
};

export function init(program: yargs.Argv) {
  program.demandCommand(1, "");
  program.command("add", "Add a destination", add);
}
