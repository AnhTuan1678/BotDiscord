// @ts-nocheck
import { Client, IntentsBitField } from 'discord.js';
import openai from './config/OpenAI.js';
import dotenv from 'dotenv';

dotenv.config();

const history = []; // Lịch sử chat

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
  if (message.author.bot) return; // Bỏ qua tin nhắn từ bot khác
  history.push({ role: 'user', content: message.content });
  reply(message);
});

const reply = async (message) => {
  try {
    const covertHistory = history.map((item, index) => {
      return index === history.length - 1
        ? {
            role: 'user',
            content: `${item.content} Yêu cầu: trả lời bằng tiếng việt, ngắn gọn nhất có thể.`,
          }
        : item;
    });
    const completion = await openai.chat.completions.create({
      // Lấy lịch sử chat của người dùng
      messages: covertHistory,
      model: 'gpt-3.5-turbo',
    });

    const completionText = completion.choices[0].message.content;
    console.log('🤖', completionText);
    message.reply(completionText);
    history.push({ role: 'assistant', content: completionText });
  } catch (error) {
    message.reply('❌Có lỗi xảy ra khi tương tác với OpenAI');
  }
};

client.login(process.env.DISCORD_BOT_TOKEN);
