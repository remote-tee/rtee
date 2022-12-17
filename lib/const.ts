/**
 * Constants that could eventually be configurable via the environment
 */

import { homedir } from "os";
import path from "path";

export const DATA_DIR = path.join(homedir(), '.config', 'rtee');
export const DATA_FILE = 'metadata.json';