"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const questions_1 = require("./questions");
const fs_1 = __importDefault(require("fs"));
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TG_BOT_API, {
    polling: true,
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4,
        },
    },
});
const FILE_PATH = "./src/activeGroups.json";
let activeGroupIds = new Map();
// Function to load group IDs and Title from file
function loadGroupIds() {
    if (fs_1.default.existsSync(FILE_PATH)) {
        const data = JSON.parse(fs_1.default.readFileSync(FILE_PATH, "utf8"));
        activeGroupIds = new Map(data); // Load as a Map
        console.log("Loaded group IDs and names from file:", activeGroupIds);
    }
}
// Function to save group IDs and titles to file
function saveGroupIds() {
    const groupArray = Array.from(activeGroupIds.entries()); // Convert Map to Array of entries
    fs_1.default.writeFileSync(FILE_PATH, JSON.stringify(groupArray), "utf8");
}
// Load group IDs when bot starts
loadGroupIds();
let currentQuestionIndex = 0;
let activeGroupId = null;
const interval = 900000;
// Listen for the /startquiz command to capture the group ID
bot.onText(/\/startquiz/, (msg) => {
    const chatId = msg.chat.id;
    // Only add the group ID if it's a group and hasn't been added before
    bot.onText(/\/startquiz/, (msg) => {
        const chatId = msg.chat.id;
        const chatName = msg.chat.title || "Unnamed Group"; // Use title or fallback
        if ((msg.chat.type === "group" || msg.chat.type === "supergroup") &&
            !activeGroupIds.has(chatId)) {
            activeGroupIds.set(chatId, chatName); // Save chat ID and name
            saveGroupIds(); // Save to file
            console.log(`Added group ${chatId} (${chatName}) to active group list`);
            bot.sendMessage(chatId, "This group is now enrolled to receive quiz questions every 15 minutes!");
        }
    });
});
// Function to send the quiz question to each tracked group
function sendQuizQuestion() {
    if (currentQuestionIndex < questions_1.quizQuestions.length) {
        const question = questions_1.quizQuestions[currentQuestionIndex];
        activeGroupIds.forEach((chatName, chatId) => {
            bot
                .sendPoll(chatId, question.question, question.options, {
                type: "quiz",
                correct_option_id: question.correctOptionId,
                is_anonymous: false,
            })
                .catch((error) => {
                console.error(`Failed to send quiz to group ${chatId} (${chatName})`);
            });
        });
        currentQuestionIndex++; // Move to the next question
    }
    else {
        currentQuestionIndex = 0; // Reset after the last question
    }
}
// Schedule the quiz to be sent every 15 minutes (900000 ms)
setInterval(sendQuizQuestion, interval); // 15 minutes
function msToMinutes(ms) {
    return ms / 60000;
}
// Example usage:
const minutes = msToMinutes(interval);
console.log("interval time:", minutes, "mins");
// Listen for poll answers from users
bot.on("poll_answer", (msg) => {
    const userAnswerIndex = msg.option_ids[0];
    const correctAnswerIndex = questions_1.quizQuestions[currentQuestionIndex].correctOptionId;
    if (userAnswerIndex === correctAnswerIndex) {
        currentQuestionIndex++;
        if (activeGroupId) {
            sendQuizQuestion(); // Send the next question to the group
        }
    }
    else
        null;
});
