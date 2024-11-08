import { books } from "./db/migrations/schema";
import { db } from "./db";

// Define the type for a single quiz question
interface QuizQuestionType {
  question: string;
  options: string[];
  correctOptionId: number;
}

// Load quiz questions from the database
export async function loadQuizQuestions(): Promise<QuizQuestionType[]> {
  const data = await db.select({ quizs: books.quizs }).from(books);

  if (data[0]?.quizs) {
    return data[0].quizs as QuizQuestionType[];
  } else {
    console.log("No quiz questions found in the database.");
    return []; // Return an empty array if no questions are found
  }
}

// Update quiz questions in the database
export async function saveQuizQuestions(questionsArray: QuizQuestionType[]) {
  try {
    // Update the `quizs` field in the `books` table with the new data, replacing existing content
    await db.update(books).set({ quizs: questionsArray }).execute();
    console.log("Quiz questions saved to the database successfully.");
  } catch (error) {
    console.error("Failed to save quiz questions to the database:", error);
  }
}
