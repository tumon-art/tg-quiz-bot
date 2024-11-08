import { pgTable, bigint, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const books = pgTable("books", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "books_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	quizs: jsonb(),
	activeGroups: jsonb().default([[-1002002320065,"test"],[-4586135068,"test 2"]]),
});
