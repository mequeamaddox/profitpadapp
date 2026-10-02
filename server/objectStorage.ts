import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { Response } from "express";
import { randomUUID } from "crypto";

// S3-compatible bucket (Railway Buckets, Neon Storage, R2, AWS...).
// Configured with AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3,
// AWS_REGION and S3_BUCKET.
let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION || "auto",
      endpoint: process.env.AWS_ENDPOINT_URL_S3 || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    });
  }
  return client;
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("S3_BUCKET not set. Configure an S3-compatible bucket.");
  }
  return bucket;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export const UPLOAD_URL_PREFIX = "/api/objects/upload/";

export interface StoredObject {
  key: string;
  contentType?: string;
  contentLength?: number;
  body: Readable;
}

export class ObjectStorageService {
  constructor() {}

  // Returns a same-origin URL the client PUTs the file to; the server
  // streams it into the bucket so the bucket needs no CORS config.
  async getObjectEntityUploadURL(): Promise<string> {
    getBucket();
    return `${UPLOAD_URL_PREFIX}${randomUUID()}`;
  }

  async uploadObject(objectId: string, body: Buffer, contentType: string) {
    await getClient().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: `receipts/${objectId}`,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  // Gets the object entity from the object path (/objects/<key>).
  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const key = objectPath.slice("/objects/".length);
    if (!key) {
      throw new ObjectNotFoundError();
    }

    try {
      const result = await getClient().send(
        new GetObjectCommand({ Bucket: getBucket(), Key: key }),
      );
      return {
        key,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        body: result.Body as Readable,
      };
    } catch (error: any) {
      if (error instanceof NoSuchKey || error?.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const pathname = rawPath.split("?")[0];
    if (!pathname.startsWith(UPLOAD_URL_PREFIX)) {
      return rawPath;
    }
    const objectId = pathname.slice(UPLOAD_URL_PREFIX.length);
    return `/objects/receipts/${objectId}`;
  }

  // Streams an object to the response.
  async downloadObject(file: StoredObject, res: Response, cacheTtlSec: number = 3600) {
    try {
      res.set({
        "Content-Type": file.contentType || "application/octet-stream",
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });
      if (file.contentLength !== undefined) {
        res.set("Content-Length", String(file.contentLength));
      }

      file.body.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      file.body.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
}
