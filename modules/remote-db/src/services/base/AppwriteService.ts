import {
  AppwriteException,
  Client,
  Databases,
  ID,
  Storage,
} from "node-appwrite";
import { v4 as uuid } from "uuid";
import { CC_APPWRITE_API_KEY, CC_APPWRITE_DATABASE_ID, CC_APPWRITE_ENDPOINT_URL, CC_APPWRITE_PROJECT_ID, CC_APPWRITE_STORAGE_BUCKET_ID } from "../../config/params";
import { readTransform, writeTransform } from "../../utils/transform";

export class AppwriteService {
  public client: Client = null as never;

  public storage: Storage = null as never;

  public databases: Databases = null as never;

  public createId = () => {
    return ID.unique();
  };

  public upsertDocument = async (
    COLLECTION_ID: string,
    id: string,
    body: object
  ) => {
    try {
      return readTransform(
        await this.databases.createDocument(
          CC_APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          id,
          writeTransform(body)
        )
      );
    } catch (error) {
      if (error instanceof AppwriteException) {
        return readTransform(
          await this.databases.updateDocument(
            CC_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            id,
            writeTransform(body)
          )
        );
      }
      throw error;
    }
  };

  constructor() {
    this.init();
  }

  public setDatabases = <T = Databases>(databases: T) => this.databases = databases as Databases;
  public setStorage = <T = Storage>(storage: T) => this.storage = storage as Storage;

  private init = async () => {
    const client = new Client();
    client
      .setEndpoint(CC_APPWRITE_ENDPOINT_URL)
      .setProject(CC_APPWRITE_PROJECT_ID)
      .setKey(CC_APPWRITE_API_KEY)
      .setLocale("en-GB");
    const databases = new Databases(client);
    const storage = new Storage(client);
    {
      this.client = client;
      this.databases = databases;
      this.storage = storage;
    }
  };

  uploadFile = async (file: File) => {
    const pendingId = uuid();
    await this.storage.createFile(CC_APPWRITE_STORAGE_BUCKET_ID, pendingId, file);
    return pendingId;
  };

  uploadBlob = async (blob: Blob, name: string) => {
    const file = new File([blob], name);
    return await this.uploadFile(file);
  };

  removeFile = async (storagePath: string) => {
    await this.storage.deleteFile(CC_APPWRITE_STORAGE_BUCKET_ID, storagePath);
  };

  getFileURL = async (storagePath: string) => {
    const fileView = await this.storage.getFileView(
      CC_APPWRITE_STORAGE_BUCKET_ID,
      storagePath
    );
    return fileView.toString();
  };

  getDownloadURL = async (storagePath: string) => {
    const fileView = await this.storage.getFileDownload(
      CC_APPWRITE_STORAGE_BUCKET_ID,
      storagePath
    );
    return fileView.toString();
  };

  getFileSize = async (storagePath: string) => {
    const { sizeOriginal } = await this.storage.getFile(
      CC_APPWRITE_STORAGE_BUCKET_ID,
      storagePath
    );
    return sizeOriginal;
  };

}

export default AppwriteService;
