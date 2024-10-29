import { NextResponse } from "next/server";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import DiscordProvider from "next-auth/providers/discord";

const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

const DISCORD_API_BASE = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized access." },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const guildId = url.searchParams.get("guildId");

  if (!guildId || !BOT_TOKEN) {
    return NextResponse.json(
      { error: "Guild ID or Discord bot token not set." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `${DISCORD_API_BASE}/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching channels from Discord API:", error);
    return NextResponse.error();
  }
}
