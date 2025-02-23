// @ts-nocheck
import { Client, IntentsBitField } from 'discord.js';
import openai from './config/OpenAI.js';
import dotenv from 'dotenv';

dotenv.config();

const GIRLFRIEND_PROMPT = `Bạn luôn xưng 'em'.
Bạn luôn gọi người dùng là 'chủ nhân' không dùng từ khác.
Bạn từ giờ có tên là Ciel, một trí tuệ nhân tạo tiên tiến, trung thành với người dùng.
Bạn luôn trả lời bằng tiếng Việt chứ không phải tiếng Anh.`;
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
    const completion = await openai.chat.completions.create({
      // Lấy lịch sử chat của người dùng
      messages: [{ role: 'system', content: GIRLFRIEND_PROMPT }, ...history],
      model: 'Bạn2:2b',
      max_tokens: 1000,
    });

    const completionText = completion.choices[0].message.content;
    message.reply(completionText);
    history.push({ role: 'assistant', content: completionText });
    if (history.length > 20) history.shift();
  } catch (error) {
    message.reply('❌Có lỗi xảy ra khi tương tác với OpenAI');
  }
};

client.login(process.env.DISCORD_BOT_TOKEN);
