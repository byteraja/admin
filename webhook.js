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

// MD5 encoding function
function encodeMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// MD5 decoding function (MD5 is one-way, so this attempts to find matches)
function decodeMD5(hash) {
  // This is a simple implementation - in practice, you'd use a rainbow table
  // or online MD5 lookup services
  return `MD5 hash: ${hash}\n\nNote: MD5 is a one-way hash function. To "decode" it, you would need to:\n1. Use a rainbow table lookup\n2. Try common passwords/strings\n3. Use online MD5 decryption services`;
}

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
      // Handle MD5 encoding command
      if (text.startsWith('/encode ')) {
        const textToEncode = text.substring(8); // Remove '/encode ' prefix
        if (!textToEncode) {
          await bot.sendMessage(chatId, '⚠️ Usage: /encode <text_to_encode>');
          return res.status(200).json({ status: 'invalid_encode_format' });
        }
        
        const md5Hash = encodeMD5(textToEncode);
        await bot.sendMessage(chatId, `🔐 MD5 Hash:\n\`${md5Hash}\``, { parse_mode: 'Markdown' });
        return res.status(200).json({ status: 'md5_encoded' });
      }

      // Handle MD5 decoding command
      if (text.startsWith('/decode ')) {
        const hashToDecode = text.substring(8); // Remove '/decode ' prefix
        if (!hashToDecode) {
          await bot.sendMessage(chatId, '⚠️ Usage: /decode <md5_hash>');
          return res.status(200).json({ status: 'invalid_decode_format' });
        }
        
        const decodeResult = decodeMD5(hashToDecode);
        await bot.sendMessage(chatId, decodeResult);
        return res.status(200).json({ status: 'md5_decode_info' });
      }

      // Handle help command
      if (text === '/help' || text === '/start') {
        const helpMessage = `🤖 **MD5 Encoder/Decoder Bot**

**Available Commands:**
• \`/encode <text>\` - Encode text to MD5 hash
• \`/decode <hash>\` - Get info about MD5 hash (note: MD5 is one-way)
• \`/help\` - Show this help message

**Examples:**
• \`/encode hello world\`
• \`/decode 5eb63bbbe01eeed093cb22bb8f5acdc3\`

**Note:** MD5 is a one-way hash function, so "decoding" requires lookup tables or brute force.`;

        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
        return res.status(200).json({ status: 'help_sent' });
      }

      // Forward other messages to support team
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
