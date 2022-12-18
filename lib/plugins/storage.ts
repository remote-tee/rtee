import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { DATA_DIR } from "../const";

/**
 * Persistent storage for plugins to use
 */
export abstract class Storage {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract set(k: string, v: string): void;
  abstract get(k: string): string;
}


export class LocalFileStorage extends Storage {
  set(k: string, v: string) {
    let data = this.loadFile();
    data[k] = v;
    this.saveFile(data);
  }

  get(k: string): string {
    return this.loadFile()[k];
  }

  private loadFile(): Record<string, string> {
    let filename = path.join(DATA_DIR, this.name, 'storage.json');

    if (!existsSync(filename)) {
      return {};
    }

    let data = readFileSync(filename, 'utf-8');
    return JSON.parse(data);
  }

  private saveFile(data: Record<string, string>) {
    let filename = path.join(DATA_DIR, this.name, 'storage.json');
    writeFileSync(filename, JSON.stringify(data));
  }
}