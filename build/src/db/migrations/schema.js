"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.books = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.books = (0, pg_core_1.pgTable)("books", {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: (0, pg_core_1.bigint)({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "books_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
    quizs: (0, pg_core_1.jsonb)(),
    activeGroups: (0, pg_core_1.jsonb)().default([[-1002002320065, "test"], [-4586135068, "test 2"]]),
});
