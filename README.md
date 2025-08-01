# MD5 Encoder/Decoder Telegram Bot

A Telegram bot that provides MD5 encoding and decoding functionality. The bot can encode text to MD5 hashes and provide information about MD5 hash decoding.

## Features

- **MD5 Encoding**: Convert any text to its MD5 hash
- **MD5 Decoding Info**: Get information about MD5 hash decoding (since MD5 is one-way)
- **Help System**: Built-in help command with usage examples
- **Support Integration**: Forwards non-command messages to support team

## Commands

### `/encode <text>`
Encodes the given text to MD5 hash.

**Example:**
```
/encode hello world
```
**Output:**
```
🔐 MD5 Hash:
`5eb63bbbe01eeed093cb22bb8f5acdc3`
```

### `/decode <hash>`
Provides information about MD5 hash decoding.

**Example:**
```
/decode 5eb63bbbe01eeed093cb22bb8f5acdc3
```
**Output:**
```
MD5 hash: 5eb63bbbe01eeed093cb22bb8f5acdc3

Note: MD5 is a one-way hash function. To "decode" it, you would need to:
1. Use a rainbow table lookup
2. Try common passwords/strings
3. Use online MD5 decryption services
```

### `/help` or `/start`
Shows the help message with all available commands and examples.

## Setup

1. **Environment Variables:**
   - `BOT_TOKEN`: Your Telegram bot token from @BotFather
   - `SUPPORT_GROUP_ID`: ID of the support group for forwarding messages

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Deploy:**
   - The bot is configured for Vercel deployment
   - Set up webhook URL in your bot settings
   - Configure environment variables in Vercel

## Technical Details

- **MD5 Encoding**: Uses Node.js built-in `crypto` module
- **One-way Function**: MD5 is a cryptographic hash function that cannot be reversed
- **Hash Format**: Returns 32-character hexadecimal string
- **Case Sensitivity**: MD5 hashes are case-sensitive

## Security Notes

- MD5 is considered cryptographically broken and should not be used for security purposes
- This bot is for educational and utility purposes only
- For secure password hashing, use bcrypt, Argon2, or similar modern algorithms

## Testing

Run the test file to verify MD5 functionality:
```bash
node test_md5.js
```

## Example Hashes

| Text | MD5 Hash |
|------|----------|
| "hello world" | 5eb63bbbe01eeed093cb22bb8f5acdc3 |
| "password123" | 482c811da5d5b4bc6d497ffa98491e38 |
| "test" | 098f6bcd4621d373cade4e832627b4f6 |
| "" (empty) | d41d8cd98f00b204e9800998ecf8427e |