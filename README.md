# Esports Verification Bot

Welcome to the **Esports Verification Bot**! This bot is designed to handle user verification for Discord servers, specifically for esports communities. It verifies users through their student email addresses and manages roles based on their verification status.

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
BOT_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
VERIFIED_ROLE_NAME=YourVerifiedRoleName
EMAIL_DOMAIN=mail.dcu.ie
GUILD_ID=your_discord_guild_id
```

4. **Run the Bot**

```sh
node bot.js
```

### Usage

- **!verify your_email@mail.dcu.ie**: Sends a verification code to the provided email.
- **!code your_code**: Validates the provided verification code.
