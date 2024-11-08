export const get = <T>(
  object: T,
  path: string | (string | number)[],
  defaultValue?: any
): any => {
  // If the path is a string, split it into an array (if it's not already an array)
  const pathArray = Array.isArray(path) ? path : path.split(".");

  // Traverse the object based on the path
  return pathArray.reduce((acc: any, key: string | number) => {
    // If the accumulator is undefined or null, stop and return defaultValue
    if (acc == null) {
      return defaultValue;
    }
    // Return the value at the key, or undefined if the key doesn't exist
    return acc[key];
  }, object);
}

export default get;
