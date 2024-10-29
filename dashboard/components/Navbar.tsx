import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          DCU Esports Bot Dashboard
        </Link>
        <div className="space-x-4">
          <Link
            href="/terms-of-service"
            className="text-gray-300 hover:text-white"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy-policy"
            className="text-gray-300 hover:text-white"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </nav>
  );
}
