import { Models } from "node-appwrite";

export const readTransform = <Result = any>(data: Models.Document): Result => {
  const id = data.$id;
  return Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.length ? value : null] as const;
      }
      return [key, value] as const;
    })
    .reduce((acm, [key, value]) => ({ ...acm, [key]: value }), {
      id,
    } as unknown as Result);
};

export const listTransform = <Result = any>(
  documents: Models.Document[],
): Result[] => {
  return documents.map(readTransform);
};

export const writeTransform = <Result = any>(data: {}): Result => {
  return Object.entries(data)
    .filter(([key]) => key !== "id")
    .filter(([key]) => !key.startsWith("$"))
    .filter(([key]) => !key.startsWith("system_"))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.length ? value : null] as const;
      }
      return [key, value] as const;
    })
    .reduce((acm, [key, value]) => ({ ...acm, [key]: value }), {} as Result);
};
