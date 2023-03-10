import { Storage } from "./storage";

export abstract class Destination {
  abstract send(data: string): Promise<void>;
}
export interface Args { }
export interface Context { }

export interface Plugin {
  description: string;
  init: (args: Args, storage: Storage) => Promise<Destination>;
}