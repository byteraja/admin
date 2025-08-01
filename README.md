# Telegram MD5 Encoder/Decoder Bot

A Telegram bot that provides MD5 encoding and hash verification functionality. This bot can encode text to MD5 hashes and verify if text matches a given MD5 hash.

## Features

🔐 **MD5 Encoding**: Convert any text to its MD5 hash
🔍 **Hash Verification**: Check if text matches a given MD5 hash
💬 **Support Integration**: Forward non-command messages to support team
📱 **User-Friendly**: Simple commands with clear feedback

## Commands

### `/encode <text>`
Encodes the given text to MD5 hash.

**Example:**
```
/encode hello world
```
**Response:**
```
🔐 MD5 Hash:
`5eb63bbbe01eeed093cb22bb8f5acdc3`
```

### `/check <text> <md5_hash>`
Checks if the given text matches the provided MD5 hash.

**Example:**
```
/check hello world 5eb63bbbe01eeed093cb22bb8f5acdc3
```
**Response:**
```
✅ Match!

Text: `hello world`
Hash: `5eb63bbbe01eeed093cb22bb8f5acdc3`
```

### `/help` or `/start`
Shows the help message with all available commands.

## Technical Details

- **MD5 Algorithm**: Uses Node.js built-in `crypto` module
- **Case Insensitive**: Hash comparison is case-insensitive
- **One-Way Function**: MD5 is a one-way hash function, so "decoding" is not possible
- **Verification Only**: Can only verify if text matches a hash, not reverse the hash

## Environment Variables

The bot requires the following environment variables:

- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `SUPPORT_GROUP_ID`: ID of the support group for forwarding messages

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Deploy to your preferred platform (Vercel, Heroku, etc.)

## Testing

Run the test file to verify MD5 functionality:

```bash
node test_md5.js
```

## Security Notes

- MD5 is considered cryptographically broken and should not be used for security purposes
- This bot is intended for educational and utility purposes only
- For secure hashing, consider using SHA-256 or bcrypt

## Support

For support or questions, contact the bot administrator or create an issue in this repository.