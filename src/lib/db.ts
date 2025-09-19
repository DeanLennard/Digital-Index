// src/lib/db.ts
import { MongoClient, ServerApiVersion } from "mongodb";
import type { Document, Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not set. Create .env.local and/or load it in scripts (dotenv).");
}

const globalForMongo = globalThis as unknown as {
    _mongoClient?: MongoClient;
    _mongoReady?: Promise<MongoClient>;
};

export const mongo =
    globalForMongo._mongoClient ??
    new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });

if (process.env.NODE_ENV !== "production") {
    globalForMongo._mongoClient = mongo; // cache client across HMR
}

export async function connectMongo() {
    if (!globalForMongo._mongoReady) {
        globalForMongo._mongoReady = mongo.connect();
    }
    return globalForMongo._mongoReady;
}

export async function getDb() {
    await connectMongo();
    return mongo.db();
}

export async function col<T extends Document = Document>(name: string): Promise<Collection<T>> {
    const db = await getDb();
    return db.collection<T>(name);
}
