import { Project, Type } from "ts-morph";
import { Field, PluginSchema } from "./types";

async function generatePluginMap() {
  function getTypeName(t: Type) {
    if (t.isString()) {
      return "string";
    }
    if (t.isNumber()) {
      return "number";
    }
    throw "Unsupported type";
  }

  const project = new Project();
  project.addSourceFilesAtPaths("lib/plugins/*/**/*.ts");

  let plugins = await Promise.all(
    project.getSourceFiles().map(async (file) => {
      let path = file
        .getFilePath()
        .replace(`${process.cwd()}/`, '')
        .replace('.ts', '');
      let name = file
        .getFilePath()
        .replace(`${process.cwd()}/lib/plugins/`, "")
        .replace(".ts", "");
      let args = file.getInterface("Args");
      let destination = file.getClass("Destination");
      let description = destination?.getJsDocs().map(d => d.getInnerText()).join(", ");
      return { path, name, args, description };
    })
  );

  let map = plugins.reduce((memo, { path, args, description, name }) => {
    if (!args) {
      return memo;
    }

    memo[name] = {
      path,
      schema: {
        title: name,
        description: description?.trim(),
        type: "object",
        required: args
          .getProperties()
          .filter((p) => !p.hasQuestionToken())
          .map((p) => p.getName()),
        properties: args.getProperties().reduce((memo, p) => {
          memo[p.getName()] = {
            type: getTypeName(p.getType()),
            description:
              p
                .getJsDocs()
                .map((doc) => doc.getInnerText())
                .join(". ") || undefined,
          };

          return memo;
        }, {} as Record<string, Field>),
      }
    };

    return memo;
  }, {} as Record<string, PluginSchema>);

  console.log(JSON.stringify(map));
}

generatePluginMap();
