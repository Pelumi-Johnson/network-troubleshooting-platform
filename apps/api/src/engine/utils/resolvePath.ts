export function resolvePath(object: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, object);
}