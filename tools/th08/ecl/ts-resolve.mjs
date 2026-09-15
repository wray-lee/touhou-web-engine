/**
 * Resolver hook so plain Node can import the repo's extensionless TS modules.
 *
 * The ECL tooling lives in `src/th08/format/*.ts` and imports each other
 * without extensions (Vite style). Node needs the suffix, so we retry with
 * `.ts` / `/index.ts` before giving up.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      for (const suffix of ['.ts', '/index.ts', '.mts']) {
        try {
          return await nextResolve(specifier + suffix, context);
        } catch {
          /* keep looking */
        }
      }
    }
    throw err;
  }
}
