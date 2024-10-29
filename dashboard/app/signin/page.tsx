"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleSignIn = () => {
    signIn("discord", { callbackUrl: "/admin" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <h1 className="text-4xl font-bold mb-4">Sign In</h1>
      <p className="mb-6">
        Please sign in to access the features of our Discord bot.
      </p>
      <button
        onClick={handleSignIn}
        className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition duration-200"
      >
        Sign in with Discord
      </button>
    </div>
  );
}
