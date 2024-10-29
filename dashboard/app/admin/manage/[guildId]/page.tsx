"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

interface Channel {
  id: string;
  name: string;
}

interface GuildData {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  settings: ServerSetting | null;
  channels: Channel[];
}

const getChannelNames = async (
  guildId: string,
  channelIds: string[]
): Promise<Channel[]> => {
  const channels: Channel[] = [];
  try {
    const response = await axios.get(
      `/api/discord/channels?guildId=${guildId}`
    );

    const allChannels: Channel[] = response.data;
    channelIds.forEach((channelId) => {
      const channel = allChannels.find((c) => c.id === channelId);
      if (channel) {
        channels.push({ id: channel.id, name: channel.name });
      }
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
  }
  return channels;
};

export default function ManageServerPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const router = useRouter();
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("settings");

  useEffect(() => {
    const fetchParams = async () => {
      if (params) {
        const resolvedParams = await params;
        const guildId = resolvedParams.guildId;

        const response = await fetch(`/api/discord/guilds`);
        const serverSettings = await response.json();

        const guildInfo = serverSettings.find(
          (setting: ServerSetting) => setting.guildId === guildId
        );

        if (guildInfo) {
          const channelIds = [
            guildInfo.countingChannelId,
            guildInfo.generalChannelId,
            guildInfo.logChannelId,
            guildInfo.verificationChannelId,
            guildInfo.actionItemsChannelId,
            guildInfo.actionItemsTargetChannelId,
          ];
          const channels = await getChannelNames(guildId, channelIds);

          setGuildData({
            guildId,
            guildName: guildInfo.guildName,
            guildIcon: guildInfo.guildIcon,
            settings: guildInfo,
            channels,
          });
        }
      }
    };

    fetchParams();
  }, [params]);

  const renderSettingsContent = () => {
    if (!guildData?.settings) return <div>No settings found.</div>;

    const {
      emailDomains,
      countingChannelId,
      generalChannelId,
      logChannelId,
      verificationChannelId,
      verifiedRoleName,
      actionItemsChannelId,
      actionItemsTargetChannelId,
    } = guildData.settings;

    const countingChannel =
      guildData.channels?.find((c) => c.id === countingChannelId)?.name ||
      countingChannelId;
    const generalChannel =
      guildData.channels?.find((c) => c.id === generalChannelId)?.name ||
      generalChannelId;
    const logChannel =
      guildData.channels?.find((c) => c.id === logChannelId)?.name ||
      logChannelId;
    const verificationChannel =
      guildData.channels?.find((c) => c.id === verificationChannelId)?.name ||
      verificationChannelId;
    const actionItemsChannel =
      guildData.channels?.find((c) => c.id === actionItemsChannelId)?.name ||
      actionItemsChannelId;
    const actionItemsTargetChannel =
      guildData.channels?.find((c) => c.id === actionItemsTargetChannelId)
        ?.name || actionItemsTargetChannelId;

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Current Server Settings</h2>
        <div>
          <strong>Guild ID:</strong> {guildData.guildId}
        </div>
        <div>
          <strong>Email Domains:</strong> {emailDomains.join(", ") || "None"}
        </div>
        <div>
          <strong>Counting Channel:</strong> {countingChannel}
        </div>
        <div>
          <strong>General Channel:</strong> {generalChannel}
        </div>
        <div>
          <strong>Log Channel:</strong> {logChannel}
        </div>
        <div>
          <strong>Verification Channel:</strong> {verificationChannel}
        </div>
        <div>
          <strong>Verified Role Name:</strong> {verifiedRoleName}
        </div>
        <div>
          <strong>Action Items Channel:</strong> {actionItemsChannel}
        </div>
        <div>
          <strong>Action Items Target Channel:</strong>{" "}
          {actionItemsTargetChannel}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return renderSettingsContent();
      case "roles":
        return <div>Roles management for {guildData?.guildName}</div>;
      case "channels":
        return <div>Channels management for {guildData?.guildName}</div>;
      case "logs":
        return <div>Logs for {guildData?.guildName}</div>;
      default:
        return <div>Select a tab to manage.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      <aside className="w-64 bg-gray-800 p-4">
        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left p-2 rounded hover:bg-gray-700 ${
                activeTab === "settings" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Server Settings
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded hover:bg-gray-700 ${
                activeTab === "roles" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("roles")}
            >
              Manage Roles
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded hover:bg-gray-700 ${
                activeTab === "channels" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("channels")}
            >
              Manage Channels
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded hover:bg-gray-700 ${
                activeTab === "logs" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("logs")}
            >
              View Logs
            </button>
          </li>
        </ul>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-4">
          Manage Server: {guildData ? guildData.guildName : "Loading..."}
        </h1>
        {guildData?.guildIcon && (
          <img
            src={`https://cdn.discordapp.com/icons/${guildData.guildId}/${guildData.guildIcon}.png`}
            alt={`${guildData.guildName} icon`}
            className="w-24 h-24 mb-4"
          />
        )}
        {renderContent()}
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition duration-200"
        >
          Back
        </button>
      </main>
    </div>
  );
}
