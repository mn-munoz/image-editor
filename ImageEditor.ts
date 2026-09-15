import { readFileSync } from "node:fs";
import process from 'process';

const args: string[] = process.argv.slice(2);
console.log(args);
