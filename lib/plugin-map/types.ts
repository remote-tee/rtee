export interface Field {
  description?: string;
  type: "string" | "number" | "boolean";
}

export interface PluginArgs {
  title: string;
  description?: string;
  type: "object";
  required: string[];
  properties: Record<string, Field>;
}

export interface PluginSchema {
  schema: PluginArgs;
  path: string;
}

export type PluginMap = Record<string, PluginSchema>;
