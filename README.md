# Discord Verification Bot

Welcome to the **Discord Verification Bot**! This bot is designed to handle user verification for Discord servers. It verifies users through their student email addresses and manages roles based on their verification status.

## Features

- **Email Verification**: Users receive a verification code via email and must enter it in Discord to verify their account.
- **Role Management**: Automatically assigns a specific role to users once they have been verified.
- **Customizable**: Easy to configure email domains, roles, and channels for different needs.
- **Expiration Handling**: Verification codes expire after 10 minutes for added security.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- A Discord bot token (create a bot on the [Discord Developer Portal](https://discord.com/developers/applications)).
- Access to a MongoDB database (you can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a free tier).
- A Gmail account for sending emails (you can use any email service, but make sure to adjust the Nodemailer configuration).

### Installation

1. **Clone the Repository**

```sh
git clone git@github.com:aydenjahola/esports-verification-bot.git
cd esports-verification-bot
```

2. **Install Dependencies**

```sh
npm install
```

3. **Set Up Environment Variables**

Create a `.env` file in the root directory and add the following:

```env
# Bot token
BOT_TOKEN=YOUR_BOT_TOKEN

# Nodemailer
EMAIL_NAME="Example"
EMAIL_USER=example@example.com
EMAIL_PASS=YOUR_EMAIL_PASS

# Allowed domains for email verification
EMAIL_DOMAINS=example@example.com // or it can be a list, example: "example.com,example2.com"

# Discord
GUILD_ID=YOUR_GUILD_ID
VERIFICATION_CHANNEL_NAME=YOUR_VERIFICATION_CHANNEL_NAME
VERIFIED_ROLE_NAME=YOUR_VERIFIED_ROLE_NAME

# Database
MONGODB_URI=YOUR_MONGODB_URI
```

this can also be seen in in the [.env.example](./.env.example)

4. **Run the Bot**

```sh
node bot.js
```

### Usage

- **/verify your_email@example.com**: Sends a verification code to the provided email.
- **/code your_code**: Validates the provided verification code.
