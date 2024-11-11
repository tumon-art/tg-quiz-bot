"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chart_1 = require("./chart");
const TelegramBot = require("node-telegram-bot-api");
// const http = require("http");
const fs = __importStar(require("fs"));
const bot = new TelegramBot(process.env.TG_BOT_API, {
    polling: true,
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4,
        },
    },
});
// Function to parse chart data from the /plot command
function parsePlotCommand(text) {
    const pairs = text.split(/\s*,\s*/); // Split by commas, removing extra spaces
    console.log("Pairs:", pairs); // Log the split pairs to see the result
    let labels = [];
    let data = [];
    for (const pair of pairs) {
        const [label, value] = pair.split(":"); // Split each pair by ":"
        if (label && value && !isNaN(Number(value))) { // Ensure value is a number
            labels.push(label.trim()); // Push label to the labels array
            data.push(Number(value.trim())); // Convert value to number and push to data array
        }
        else {
            console.log(`Skipping invalid pair: ${pair}`); // Log invalid pairs
            return null; // Return null if any pair is invalid
        }
    }
    if (labels.length > 0 && data.length > 0) {
        return { labels, data }; // Return the labels and data arrays if valid
    }
    return null; // Return null if no valid labels or data exist
}
//
// Listen for /plot command with new format
bot.onText(/\/plot\s+(.*)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const commandText = match[1].trim(); // Remove leading/trailing spaces
    console.log("Received command:", commandText); // Log the received command
    const parsedData = parsePlotCommand(commandText);
    console.log("Parsed Data:", parsedData); // Log the parsed data
    if (!parsedData) {
        // Send a reply if data is invalid
        bot.sendMessage(chatId, "Please provide the data in the format: /plot A:10 B:20 C:70", {
            reply_to_message_id: msg.message_id // Reply to the original message
        });
        return;
    }
    const { labels, data } = parsedData;
    try {
        // Generate the chart
        const imagePath = yield (0, chart_1.createChart)(labels, data);
        // Send the generated chart image as a reply to the original message
        yield bot.sendPhoto(chatId, imagePath, {
            reply_to_message_id: msg.message_id // Reply to the original message
        });
        // Clean up the image after sending
        fs.unlinkSync(imagePath);
    }
    catch (error) {
        console.error('Error generating or sending chart:', error);
        bot.sendMessage(chatId, "Sorry, there was an error creating the chart.", {
            reply_to_message_id: msg.message_id // Reply to the original message
        });
    }
}));
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
// // HTTP server for health check
// const server = http.createServer((_req: any, res: any) => {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("Bot is running!\n");
// });
//
// server.listen(8080, () => {
//   console.log("HTTP server is listening on port 8080");
// });
// [
//   [-1002002320065, "test"],
//   [-4586135068, "test 2"],
//   [-1002133503411, "Just for debate"]
// ]
//
