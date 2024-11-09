import { Models, Query } from "node-appwrite";

import { iterateDocuments, queued, sleep } from "functools-kit";
import { CC_APPWRITE_DATABASE_ID } from "../config/params";
import { listTransform } from "./transform";

const TOTAL_DOCUMENTS_LIMIT = 10_000;
const DOCUMENTS_PAGE_SIZE = 5_000;
const DOCUMENT_READ_DELAY = 100;

interface IConfig {
  totalDocuments: number;
  pageSize: number;
  readDelay: number;
}

interface IRowData {
  id: string;
}

export const listDocuments = async function* <T extends Models.Document & IRowData>(
  collectionId: string,
  query: string[] = [],
  {
    totalDocuments = TOTAL_DOCUMENTS_LIMIT,
    pageSize = DOCUMENTS_PAGE_SIZE,
    readDelay = DOCUMENT_READ_DELAY,
  }: Partial<IConfig> = {},
) {
  const { db } = await import("../index");
  for await (const rows of iterateDocuments<T>({
    limit: pageSize,
    delay: readDelay,
    totalDocuments,
    async createRequest({ lastId, limit }) {
      const { documents } = await db.appwriteService.databases.listDocuments(
        CC_APPWRITE_DATABASE_ID,
        collectionId,
        [
          Query.orderDesc("$updatedAt"),
          ...(lastId ? [Query.cursorAfter(lastId as string)] : []),
          Query.limit(limit),
          ...query,
        ],
      );
      return listTransform(documents);
    },
  })) {
    yield rows;
  }
};

export default listDocuments;
