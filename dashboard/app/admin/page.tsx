"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ServerSetting {
  _id: string;
  guildId: string;
  guildName: string;
  guildIcon: string | null;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [serverSettings, setServerSettings] = useState<ServerSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const fetchServerSettings = async () => {
      try {
        const response = await fetch("/api/discord/guilds");
        if (!response.ok) {
          throw new Error("Failed to fetch server settings");
        }
        const data = await response.json();
        console.log("Fetched Server Settings:", data);
        setServerSettings(data);
      } catch (error) {
        console.error("Error fetching server settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServerSettings();
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  const handleServerClick = (guildId: string) => {
    router.push(`/admin/manage/${guildId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Admin Page!</h1>
      <p className="mb-6">You are signed in as: {session.user?.name}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-6 py-2 bg-red-600 rounded hover:bg-red-500 transition duration-200 mb-4"
      >
        Sign Out
      </button>

      {loading ? (
        <p className="mt-4">Loading server settings...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {serverSettings.map((setting) => (
            <div
              key={setting._id}
              onClick={() => handleServerClick(setting.guildId)}
              className="bg-gray-800 p-4 rounded shadow-md cursor-pointer hover:bg-gray-700 transition duration-200 flex flex-col items-center"
            >
              {setting.guildIcon && (
                <img
                  src={`https://cdn.discordapp.com/icons/${setting.guildId}/${setting.guildIcon}.png`}
                  alt={`${setting.guildName} icon`}
                  className="w-16 h-16 rounded-full mb-2"
                />
              )}
              <h2 className="text-lg font-bold">{setting.guildName}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
