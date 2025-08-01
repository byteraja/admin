const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');

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

    // Handle MD5 encoding command
    if (text.startsWith('/md5encode')) {
      const textToEncode = text.replace('/md5encode', '').trim();
      if (!textToEncode) {
        await bot.sendMessage(chatId, `⚠️ Usage: /md5encode <text to encode>\nExample: /md5encode hello world`);
        return res.status(200).json({ status: 'md5_encode_help' });
      }
      
      const md5Hash = crypto.createHash('md5').update(textToEncode).digest('hex');
      await bot.sendMessage(chatId, `🔐 MD5 Encoded:\n\n📝 Original: ${textToEncode}\n🔑 MD5 Hash: \`${md5Hash}\``, { parse_mode: 'Markdown' });
      return res.status(200).json({ status: 'md5_encoded' });
    }

    // Handle MD5 verification (since MD5 is one-way, we can't decode but can verify)
    if (text.startsWith('/md5verify')) {
      const parts = text.replace('/md5verify', '').trim().split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, `⚠️ Usage: /md5verify <original_text> <md5_hash>\nExample: /md5verify "hello world" 5d41402abc4b2a76b9719d911017c592`);
        return res.status(200).json({ status: 'md5_verify_help' });
      }
      
      const originalText = parts.slice(0, -1).join(' ').replace(/"/g, '');
      const providedHash = parts[parts.length - 1];
      const calculatedHash = crypto.createHash('md5').update(originalText).digest('hex');
      
      if (calculatedHash.toLowerCase() === providedHash.toLowerCase()) {
        await bot.sendMessage(chatId, `✅ MD5 Verification Successful!\n\n📝 Text: ${originalText}\n🔑 Hash: \`${calculatedHash}\``, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, `❌ MD5 Verification Failed!\n\n📝 Text: ${originalText}\n🔑 Expected: \`${calculatedHash}\`\n🔑 Provided: \`${providedHash}\``, { parse_mode: 'Markdown' });
      }
      return res.status(200).json({ status: 'md5_verified' });
    }

    // Handle help command for MD5 functions
    if (text === '/md5help' || text === '/help') {
      const helpText = `🔐 MD5 Encoder/Decoder Bot Commands:

/md5encode <text> - Encode text to MD5 hash
Example: \`/md5encode hello world\`

/md5verify <text> <hash> - Verify if text matches MD5 hash
Example: \`/md5verify "hello world" 5d41402abc4b2a76b9719d911017c592\`

/md5help - Show this help message

📌 Note: MD5 is a one-way hash function, so decoding is not possible. Use verification instead!`;
      
      await bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
      return res.status(200).json({ status: 'help_sent' });
    }

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
