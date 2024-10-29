export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 p-4">
      <div className="container mx-auto text-center text-gray-400">
        &copy; {new Date().getFullYear()} Ayden Jahola. All rights reserved.
      </div>
    </footer>
  );
}
