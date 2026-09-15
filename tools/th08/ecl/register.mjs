/** Preload module: installs the extensionless-TypeScript resolver for Node. */
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);
