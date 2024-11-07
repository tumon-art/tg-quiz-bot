import fs from "fs";

// Define the type for a single quiz question
interface QuizQuestionType {
  question: string;
  options: string[];
  correctOptionId: number;
}

const filePath = "./src/questions.json";

// Load quiz questions from file (ensure this is updated properly each time)
export function loadQuizQuestions(): QuizQuestionType[] {
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : [];
}

// DELETE QUIZ AFTER IT HAS BEEN SENT!
export function saveQuizQuestions(questionsArray: QuizQuestionType[]) {
  fs.writeFileSync(filePath, JSON.stringify(questionsArray, null, 2), "utf8");
}
