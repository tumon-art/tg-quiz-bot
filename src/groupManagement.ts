import { eq } from "drizzle-orm";
import { db } from "./db";
import { books } from "./db/migrations/schema";

export let activeGroupIds = new Map<number, string>();

// Load group IDs and titles from file
export async function loadGroupIds() {
  const data = await db.select({ groups: books.activeGroups }).from(books).limit(1);
  activeGroupIds = new Map(data[0].groups as [number, string][]);
  console.log("Loaded group IDs and names from file:", activeGroupIds);
}

// Save group IDs and titles to file
export async function saveGroupIds() {
  const groupArray = Array.from(activeGroupIds.entries());
  try {
    // Update the `activeGroups` field in the `books` table with the new data
    await db.update(books)
      .set({ activeGroups: groupArray }) // Saving the array as JSON
      .where(
        eq(books.id, 1),
      )
    console.log("Active group IDs and names saved to the database.");
  } catch (error) {
    console.error("Error saving active group IDs to the database:", error);
  }
}
