const pkgUp = require("pkg-up").sync();

let packageJson;
if (pkgUp) {
  // eslint-disable-next-line import/no-dynamic-require
  packageJson = require(pkgUp);
}

export const hasExternalizedModuleViaJson = moduleResource => {
  const interleaveMap = packageJson.interleave;
  if (!moduleResource || !interleaveMap) return;
  const interleaveKeys = Object.keys(packageJson.interleave || {});

  if (interleaveKeys) {
    const foundMatch = interleaveKeys.find(item =>
      moduleResource.includes(item)
    );
    return interleaveMap[foundMatch] || false;
  }
};

export function interleaveConfig({ testPath, manifestName }) {
  return {
    test(module) {
      // check if module has a resource path (not virtual modules)
      if (module.resource) {
        return (
          module.resource.includes(testPath) &&
          !!hasExternalizedModuleViaJson(module.resource, manifestName)
        );
      }
    },
    // eslint-disable-next-line no-unused-vars
    name(module, chunks, cacheGroupKey) {
      // Check if module is listed in the interleave interface
      const foundValue = hasExternalizedModuleViaJson(
        module.resource,
        manifestName
      );

      if (foundValue) return foundValue;
      return false;
    },
    // force module into a chunk regardless of how its used
    enforce: true

    // might need for next.js
    // reuseExistingChunk: false,
  };
}