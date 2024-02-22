import { Client, IntentsBitField } from 'discord.js';
import openai from './config/OpenAI.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`✅Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  assistant.history.push({ role: 'user', content: message.content });
  if (message.author.bot) return; // Bỏ qua tin nhắn từ bot khác
  assistant.reply(message);
});

client.login(process.env.DISCORD_BOT_TOKEN);

const assistant = {
  role: 'assistant',
  history: [],
  // Lấy phản hồi từ OpenAI
  getResponse: async () => {
    const completion = await openai.chat.completions.create({
      messages: assistant.history,
      model: 'gpt-3.5-turbo',
      max_tokens: 4000,
      temperature: 0,
    });
    return completion.choices[0].message.content;
  },
  // Trả lời tin nhắn
  reply: async (message) => {
    const completionText = await assistant.getResponse();
    message.reply(completionText);
    assistant.history.push({ role: 'assistant', content: completionText });
  },
};
