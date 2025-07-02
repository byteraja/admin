const TelegramBot = require('node-telegram-bot-api');

let bot;

function getBot() {
  if (!bot) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error("Missing BOT_TOKEN in env");
    bot = new TelegramBot(token);
  }
  return bot;
}

const sessions = {};

module.exports = async (req, res) => {
  try {
    const body = req.body;
    const bot = getBot();

    if (!body.message || !body.message.text) {
      return res.status(200).json({ status: 'ignored' });
    }

    const { message } = body;
    const text = message.text.trim();
    const chatId = message.chat.id;

    if (message.chat.type === 'private') {
      const supportGroupId = process.env.SUPPORT_GROUP_ID;
      if (!supportGroupId) throw new Error("Missing SUPPORT_GROUP_ID in env");

      const userMessageId = message.message_id;
      sessions[userMessageId] = chatId;

      await bot.sendMessage(
        supportGroupId,
        `💬 Customer Message:\n${text}\n\nReply using:\n/reply ${userMessageId} your_message`
      );

      return res.status(200).json({ status: 'forwarded_to_team' });
    }

    if (text.startsWith('/reply')) {
      const parts = text.split(' ');
      const userMessageId = parts[1];
      const replyText = parts.slice(2).join(' ');

      if (!userMessageId || !replyText) {
        await bot.sendMessage(chatId, `⚠️ Usage: /reply <msg_id> <your message>`);
        return res.status(200).json({ status: 'invalid_reply_format' });
      }

      const customerChatId = sessions[userMessageId];
      if (!customerChatId) {
        await bot.sendMessage(chatId, `❌ Unable to find customer for message ID ${userMessageId}`);
        return res.status(200).json({ status: 'customer_not_found' });
      }

      await bot.sendMessage(customerChatId, `👨‍💼 Support:\n${replyText}`);
      return res.status(200).json({ status: 'replied_to_customer' });
    }

    return res.status(200).json({ status: 'no_action_taken' });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
