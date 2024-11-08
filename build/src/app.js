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
const quizQuestions_1 = require("./quizQuestions");
const groupManagement_1 = require("./groupManagement");
const TelegramBot = require("node-telegram-bot-api");
const http = require("http");
const bot = new TelegramBot(process.env.TG_BOT_API, {
    polling: true,
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4,
        },
    },
});
// Load group IDs when bot starts
(0, groupManagement_1.loadGroupIds)();
const interval = 900000;
// const interval = 10000;
// Only add the group ID if it's a group and hasn't been added before
bot.onText(/\/startquiz/, (msg) => {
    const chatId = msg.chat.id;
    const chatName = msg.chat.title || "Unnamed Group"; // Use title or fallback
    if ((msg.chat.type === "group" || msg.chat.type === "supergroup") &&
        !groupManagement_1.activeGroupIds.has(chatId)) {
        groupManagement_1.activeGroupIds.set(chatId, chatName); // Save chat ID and name
        (0, groupManagement_1.saveGroupIds)(); // Save to file
        console.log(`Added group ${chatId} (${chatName}) to active group list`);
        bot.sendMessage(chatId, "This group is now enrolled to receive quiz questions every 15 minutes!");
    }
});
// Function to send the quiz question to each tracked group
function sendQuizQuestion() {
    return __awaiter(this, void 0, void 0, function* () {
        let quizQuestions = yield (0, quizQuestions_1.loadQuizQuestions)();
        if (quizQuestions.length === 0) {
            console.log("Quiz questions list is empty, reloading...");
            quizQuestions = yield (0, quizQuestions_1.loadQuizQuestions)(); // Reload questions from file
            if (quizQuestions.length === 0) {
                console.log("No quiz questions available in the file.");
                return;
            }
        }
        const question = quizQuestions[0];
        console.log("Quiz sent!");
        groupManagement_1.activeGroupIds.forEach((chatName, chatId) => {
            bot
                .sendPoll(chatId, question.question, question.options, {
                type: "quiz",
                correct_option_id: question.correctOptionId,
                is_anonymous: false,
            })
                .catch((_error) => {
                console.error(`Failed to send quiz to group ${chatId} (${chatName})`);
            });
        });
        quizQuestions.shift(); // Remove the sent question from the local array
        (0, quizQuestions_1.saveQuizQuestions)(quizQuestions); // Update the questions.js file
    });
}
// Schedule the quiz to be sent at intervals
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    // quizQuestions = await loadQuizQuestions(); // Reload questions from file to make sure the array is always up-to-date
    sendQuizQuestion(); // Send the next quiz question
}), interval);
console.log("interval time:", interval / 60000, "mins");
// HTTP server for health check
const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running!\n");
});
server.listen(8080, () => {
    console.log("HTTP server is listening on port 8080");
});
// [
//   [-1002002320065, "test"],
//   [-4586135068, "test 2"],
//   [-1002133503411, "Just for debate"]
// ]
//
