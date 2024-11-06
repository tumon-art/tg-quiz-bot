import { quizQuestions } from "./questions";
import fs from "fs";
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
let activeGroupIds = new Map<number, string>();

// Function to load group IDs and Title from file
function loadGroupIds() {
  if (fs.existsSync(FILE_PATH)) {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
    activeGroupIds = new Map(data); // Load as a Map
    console.log("Loaded group IDs and names from file:", activeGroupIds);
  }
}

// Function to save group IDs and titles to file
function saveGroupIds() {
  const groupArray = Array.from(activeGroupIds.entries()); // Convert Map to Array of entries
  fs.writeFileSync(FILE_PATH, JSON.stringify(groupArray), "utf8");
}

// Load group IDs when bot starts
loadGroupIds();
let currentQuestionIndex = 0;
let activeGroupId: any = null;
const interval = 900000;

// Listen for the /startquiz command to capture the group ID
bot.onText(/\/startquiz/, (msg: any) => {
  const chatId = msg.chat.id;

  // Only add the group ID if it's a group and hasn't been added before
  bot.onText(/\/startquiz/, (msg: any) => {
    const chatId = msg.chat.id;
    const chatName = msg.chat.title || "Unnamed Group"; // Use title or fallback

    if (
      (msg.chat.type === "group" || msg.chat.type === "supergroup") &&
      !activeGroupIds.has(chatId)
    ) {
      activeGroupIds.set(chatId, chatName); // Save chat ID and name
      saveGroupIds(); // Save to file
      console.log(`Added group ${chatId} (${chatName}) to active group list`);
      bot.sendMessage(
        chatId,
        "This group is now enrolled to receive quiz questions every 15 minutes!"
      );
    }
  });
});

// Function to send the quiz question to each tracked group
function sendQuizQuestion() {
  if (currentQuestionIndex < quizQuestions.length) {
    const question = quizQuestions[currentQuestionIndex];

    activeGroupIds.forEach((chatName, chatId) => {
      bot
        .sendPoll(chatId, question.question, question.options, {
          type: "quiz",
          correct_option_id: question.correctOptionId,
          is_anonymous: false,
        })
        .catch((error: any) => {
          console.error(`Failed to send quiz to group ${chatId} (${chatName})`);
        });
    });

    currentQuestionIndex++; // Move to the next question
  } else {
    currentQuestionIndex = 0; // Reset after the last question
  }
}

// Schedule the quiz to be sent every 15 minutes (900000 ms)
setInterval(sendQuizQuestion, interval); // 15 minutes
function msToMinutes(ms: number) {
  return ms / 60000;
}

// Example usage:
const minutes = msToMinutes(interval);
console.log("interval time:", minutes, "mins");

// Listen for poll answers from users
bot.on("poll_answer", (msg: any) => {
  const userAnswerIndex = msg.option_ids[0];
  const correctAnswerIndex =
    quizQuestions[currentQuestionIndex].correctOptionId;

  if (userAnswerIndex === correctAnswerIndex) {
    currentQuestionIndex++;
    if (activeGroupId) {
      sendQuizQuestion(); // Send the next question to the group
    }
  } else null;
});
