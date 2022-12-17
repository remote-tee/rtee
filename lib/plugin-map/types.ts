export interface Field {
  description?: string;
  type: 'string' | 'number' | 'boolean';
}

export interface PluginSchema {
  title: string;
  description?: string;
  type: 'object';
  required: string[];
  properties: Record<string, Field>
}

export type PluginMap = Record<string, PluginSchema>;