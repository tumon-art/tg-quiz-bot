import { loadQuizQuestions, saveQuizQuestions } from "./quizQuestions";
import { activeGroupIds, loadGroupIds, saveGroupIds } from "./groupManagement";
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

// Load group IDs when bot starts
loadGroupIds();
// const interval = 900000;
const interval = 10000;

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

// Function to send the quiz question to each tracked group
async function sendQuizQuestion() {
  let quizQuestions = await loadQuizQuestions();
  if (quizQuestions.length === 0) {
    console.log("Quiz questions list is empty, reloading...");
    quizQuestions = await loadQuizQuestions(); // Reload questions from file
    if (quizQuestions.length === 0) {
      console.log("No quiz questions available in the file.");
      return;
    }
  }

  const question = quizQuestions[0];

  console.log("Quiz sent!");
  activeGroupIds.forEach((chatName, chatId) => {
    bot
      .sendPoll(chatId, question.question, question.options, {
        type: "quiz",
        correct_option_id: question.correctOptionId,
        is_anonymous: false,
      })
      .catch((_error: any) => {
        console.error(`Failed to send quiz to group ${chatId} (${chatName})`);
      });
  });
  quizQuestions.shift(); // Remove the sent question from the local array
  saveQuizQuestions(quizQuestions); // Update the questions.js file
}

// Schedule the quiz to be sent at intervals
setInterval(async () => {
  // quizQuestions = await loadQuizQuestions(); // Reload questions from file to make sure the array is always up-to-date
  sendQuizQuestion(); // Send the next quiz question
}, interval);
console.log("interval time:", interval / 60000, "mins");

// [
//   [-1002002320065, "test"],
//   [-4586135068, "test 2"],
//   [-1002133503411, "Just for debate"]
// ]
