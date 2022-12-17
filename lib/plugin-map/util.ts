import { Plugin } from "../plugins/types";

export async function loadPlugin(path: string): Promise<Plugin> {
  // https://github.com/vercel/pkg#snapshot-filesystem
  return await import(`/snapshot/rtee/build/${path}`);
}