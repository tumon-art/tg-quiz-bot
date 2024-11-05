import { quizQuestions } from "./questions";
import fs from 'fs';
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

const FILE_PATH = './activeGroups.json';
let activeGroupIds = new Set<number>();

// Function to load group IDs from file
function loadGroupIds() {
  if (fs.existsSync(FILE_PATH)) {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    activeGroupIds = new Set(JSON.parse(data));
    console.log("Loaded group IDs from file:", activeGroupIds);
  }
}

// Function to save group IDs to file
function saveGroupIds() {
  const groupIdsArray = Array.from(activeGroupIds); // Convert Set to Array
  fs.writeFileSync(FILE_PATH, JSON.stringify(groupIdsArray), 'utf8');
}

// Load group IDs when bot starts
loadGroupIds();
let currentQuestionIndex = 0;
let activeGroupId: any = null;
// const groupId = -1002002320065;

// Track group IDs from any incoming message in a group
// bot.on("message", (msg: any) => {
//   if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
//     activeGroupIds.add(msg.chat.id); // Add the group ID to the Set
//     console.log(`Detected group message from ${msg.chat.id}`);
//   }
// });
//
//

// Listen for the /startquiz command to capture the group ID
bot.onText(/\/startquiz/, (msg: any) => {
  const chatId = msg.chat.id;

  // Only add the group ID if it's a group and hasn't been added before
  if ((msg.chat.type === "group" || msg.chat.type === "supergroup") && !activeGroupIds.has(chatId)) {
    activeGroupIds.add(chatId);
    saveGroupIds(); // Save the updated list to the file immediately after adding the group ID
    console.log(`Added group ${chatId} to active group list`);
    bot.sendMessage(chatId, "This group is now enrolled to receive quiz questions every 5 minutes!");
  }
});


// Function to send the quiz question to each tracked group
function sendQuizQuestion(activeGroupId: any) {
  if (currentQuestionIndex < quizQuestions.length) {
    const question = quizQuestions[currentQuestionIndex];

    activeGroupIds.forEach((chatId) => {
      bot
        .sendPoll(chatId, question.question, question.options, {
          type: "quiz",
          correct_option_id: question.correctOptionId,
          is_anonymous: false,
        })
        .catch((error: any) => {
          console.error(`Failed to send quiz to group ${chatId}:`, error);
        });
    });

    currentQuestionIndex++; // Move to the next question for the next interval
  } else {
    currentQuestionIndex = 0; // Reset to the first question after the last one
  }
}

// Schedule the quiz to be sent every 15 minutes (900000 ms)
setInterval(sendQuizQuestion, 300000); // 15 minutes

// Listen for poll answers from users
bot.on("poll_answer", (msg: any) => {
  const userAnswerIndex = msg.option_ids[0];
  const correctAnswerIndex =
    quizQuestions[currentQuestionIndex].correctOptionId;

  if (userAnswerIndex === correctAnswerIndex) {
    currentQuestionIndex++;
    if (activeGroupId) {
      sendQuizQuestion(activeGroupId); // Send the next question to the group
    }
  } else null;
});
