import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import axios from "axios";

interface ServerSetting {
  _id: string;
  guildId: string;
  emailDomains: string[];
  countingChannelId: string;
  generalChannelId: string;
  logChannelId: string;
  verificationChannelId: string;
  verifiedRoleName: string;
  actionItemsChannelId: string;
  actionItemsTargetChannelId: string;
}

const DISCORD_API_BASE = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json(
      { error: "Discord bot token not set." },
      { status: 500 }
    );
  }

  try {
    const client = await clientPromise;
    const database = client.db("test");
    const collection = database.collection<ServerSetting>("serversettings");

    const serverSettings = await collection.find({}).toArray();

    const enrichedServerSettings = await Promise.all(
      serverSettings.map(async (setting) => {
        try {
          const guildResponse = await axios.get(
            `${DISCORD_API_BASE}/guilds/${setting.guildId}`,
            {
              headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
              },
            }
          );

          const guildData = guildResponse.data;

          return {
            ...setting,
            guildName: guildData.name,
            guildIcon: guildData.icon,
          };
        } catch (error) {
          console.error(
            `Error fetching guild details for ${setting.guildId}:`,
            error
          );
          return {
            ...setting,
            guildName: "Unknown Guild",
            guildIcon: null,
          };
        }
      })
    );

    return NextResponse.json(enrichedServerSettings);
  } catch (error) {
    console.error("Error fetching server settings:", error);
    return NextResponse.error();
  }
}
