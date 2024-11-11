"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeGroupIds = void 0;
exports.loadGroupIds = loadGroupIds;
exports.saveGroupIds = saveGroupIds;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const schema_1 = require("./db/migrations/schema");
exports.activeGroupIds = new Map();
// Load group IDs and titles from file
function loadGroupIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db_1.db.select({ groups: schema_1.books.activeGroups }).from(schema_1.books).limit(1);
        exports.activeGroupIds = new Map(data[0].groups);
        console.log("Loaded group IDs and names from file:", exports.activeGroupIds);
    });
}
// Save group IDs and titles to file
function saveGroupIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const groupArray = Array.from(exports.activeGroupIds.entries());
        try {
            // Update the `activeGroups` field in the `books` table with the new data
            yield db_1.db.update(schema_1.books)
                .set({ activeGroups: groupArray }) // Saving the array as JSON
                .where((0, drizzle_orm_1.eq)(schema_1.books.id, 1));
            console.log("Active group IDs and names saved to the database.");
        }
        catch (error) {
            console.error("Error saving active group IDs to the database:", error);
        }
    });
}
