# Discord Multipurpose Bot

Welcome to the **Discord Multipurpose Bot**! This bot manages user verification for Discord servers through email authentication, includes a fun trivia game feature, and provides role management and leaderboard tracking functionalities.

## Features

- **Email Verification**: Users receive a verification code via email and must enter it in Discord to verify their account.
- **Role Management**: Automatically assigns a specific role to users once they have been verified.
- **Trivia Game**: Play a video game-themed trivia game and compete with others in the server.
- **Leaderboard**: Displays the top players based on correct trivia answers.
- **Customizable**: Configure email domains, roles, trivia settings, and more to suit your server.

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

## Usage

### Information Commands

- **/botinfo**: Displays information about the bot
- **/serverinfo**: Displays information about the server

### Utility Commands

- **/help**: Lists all available commands
- **/ping**: Replies with Pong! and bot latency
- **/uptime**: Shows how long the bot has been running

### Email Verification Commands

- **/verify `your_email@example.com`**: Sends a verification code to the provided email.
- **/code `your_code`**: Validates the provided verification code and completes the verification process.

### Moderation Commands

- **/purge**: Deletes messages from the channel
- **/userinfo**: Displays information about a user
- **/warn**: Issue a warning to a user

### Fun Commands

- **/trivia**: Starts a trivia game with video game-themed, Anime & Manga, Computers, Board Games, Comics, Cartoons & Animations, Film, General Knowledge, Science, Animals, Music, History, Mythology and Geography & Nature (more to come soon!) questions. Players have 30 seconds to answer.

  - Accepts both number answers (1-4) **or** the correct answer
  - for example:
    ```sh
    Trivia Question
    In Terraria, which of these items is NOT crafted at a Mythril Anvil?
    Option 1
    Ankh Charm
    Option 2
    Sky Fracture
    Option 3
    Orichalcum Tools
    Option 4
    Venom Staff
    ```
    ##### **Answer**
    ```sh
    1
    ```
    **or**
    ```sh
    Ankh Charm
    ```

- **/leaderboard**: Displays the top 10 players on the trivia leaderboard based on their correct answers.

### Other Functionalities

- **Role Management**: Once a user is verified, they are automatically assigned a predefined role.
- **Admin Log**: Admins can review logs of verification attempts and trivia games in a designated channel.
