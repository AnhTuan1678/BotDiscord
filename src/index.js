import { Client, IntentsBitField } from 'discord.js';
import openai from './config/OpenAI.js';
import dotenv from 'dotenv';

dotenv.config();

const history = []; // Lịch sử chat
let lastTime = new Date(); // Thời gian cuối cùng chat

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
  const currentTime = new Date();
  const timeDiff = currentTime - lastTime;
  console.log('Thời gian giữa 2 tin nhắn:', timeDiff);
  if (timeDiff < 1000) {
    // Nếu thời gian giữa 2 tin nhắn < 1s thì bỏ qua
    console.log('❌Bỏ qua tin nhắn');
    return;
  } else {
    lastTime = currentTime;
    reply(message);
  }
});

const reply = async (message) => {
  try {
    console.log(history);
    const completion = await openai.chat.completions.create({
      // Lấy lịch sử chat của người dùng
      messages: history,
      model: 'gpt-3.5-turbo',
      max_tokens: 4000,
      temperature: 0,
    });

    const completionText = completion.choices[0].message.content;
    console.log('🤖', completionText);
    message.reply(completionText);
    history.push({ role: 'assistant', content: completionText });
  } catch (error) {
    message.reply('❌Có lỗi xảy ra khi tương tác với OpenAI');
    console.error(error);
  }
};

client.login(process.env.DISCORD_BOT_TOKEN);
