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
exports.loadQuizQuestions = loadQuizQuestions;
exports.saveQuizQuestions = saveQuizQuestions;
const schema_1 = require("./db/migrations/schema");
const db_1 = require("./db");
// Load quiz questions from the database
function loadQuizQuestions() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = yield db_1.db.select({ quizs: schema_1.books.quizs }).from(schema_1.books);
        if ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.quizs) {
            return data[0].quizs;
        }
        else {
            console.log("No quiz questions found in the database.");
            return []; // Return an empty array if no questions are found
        }
    });
}
// Update quiz questions in the database
function saveQuizQuestions(questionsArray) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Update the `quizs` field in the `books` table with the new data, replacing existing content
            yield db_1.db.update(schema_1.books).set({ quizs: questionsArray }).execute();
            console.log("Quiz questions saved to the database successfully.");
        }
        catch (error) {
            console.error("Failed to save quiz questions to the database:", error);
        }
    });
}
