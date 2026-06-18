import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bookmarks, studySessions, type InsertBookmark, type InsertStudySession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Bookmark queries
export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(bookmarks.createdAt);
}

export async function createBookmark(data: InsertBookmark) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookmarks).values(data);
  return result;
}

export async function deleteBookmark(bookmarkId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)));
}

// Study session queries
export async function getUserStudySessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(studySessions.createdAt);
}

export async function createStudySession(data: InsertStudySession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(studySessions).values(data);
}

export async function getStudyStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const sessions = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId));

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60;
  const uniqueAreas = new Set(sessions.map(s => s.knowledgeAreaId)).size;

  return {
    totalSessions,
    totalMinutes: Math.round(totalMinutes),
    uniqueAreasStudied: uniqueAreas,
  };
}
