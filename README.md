# Discord Multipurpose Bot

## IMPORTANT: PLEASE READ BEFORE DEPLOYING

This bot includes game statistics functionality (currently supports Valorant, CS2 and TFT). Unfortunately, due to [Tracker.gg](https://tracker.gg/) no longer providing API keys, I have created my own API to retrieve the data. Currently, this API is not publicly available. If you wish to use the bot's game stats commands, please feel free to reach out to me via my [email](mailto:info@aydenjahola.com).

---

Welcome to the **Discord Multipurpose Bot**! This bot manages user verification for Discord servers through email authentication, includes a fun trivia game feature, and provides role management and leaderboard tracking functionalities.

## Features

- **Email Verification**: Users receive a verification code via email and must enter it in Discord to verify their account.
- **Role Management**: Automatically assigns a specific role to users once they have been verified.
- **Trivia Game**: Play a video game-themed trivia game with various categories such as Anime & Manga, Computers, Board Games, Comics, Cartoons & Animations, Film, General Knowledge, Science, Animals, Music, History, Mythology, and Geography & Nature.
- **Leaderboard**: Displays the top players based on correct trivia answers.
- **User Information**: Retrieve information about a specific user or yourself, including roles and account details.
- **Warning System**: Issue warnings to users with a reason logged for future reference.
- **Message Purge**: Moderators can delete messages from a channel.
- **Ping and Uptime**: Check the bot's latency and how long it has been running.
- **Admin Log**: Admins can review logs of verification attempts and trivia games in a designated channel.
- **Customizable Settings**: Configure email domains, channels, roles, and more to suit your server.
- **Help Command**: List all available commands and their descriptions for easy reference.

### Installation

1. **Clone the Repository**

```sh
git clone git@github.com:aydenjahola/discord-multipurpose-bot.git
```

```sh
cd discord-multipurpose-bot
```

2. **Install Dependencies**

```sh
npm install
```

3. **Set Up Environment Variables**

rename the [`.env.example`](./.env.example) to `.env` and fill in the required environments

4. **Run the Bot**

```sh
node bot.js
```

## Setup

make sure to run `/setup` or otherwise the verification process wont work.

## Usage

run `/help` command to get list of all avaiable commands, or visit the [commands](./commands/) directory to view them.
