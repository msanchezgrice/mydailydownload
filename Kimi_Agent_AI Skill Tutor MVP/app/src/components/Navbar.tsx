import { Link } from "react-router";

/**
 * Minimal branded top nav for My Daily Download.
 * Wordmark links home; quick link to onboarding.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[rgba(11,12,16,0.85)] backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto h-16 px-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#E0E2E8] font-bold tracking-tight"
        >
          <span className="w-7 h-7 rounded-md bg-[#F2A900] flex items-center justify-center text-[#0B0C10] text-sm font-extrabold">
            D
          </span>
          <span className="text-[15px]">My Daily Download</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/onboarding"
            className="text-sm font-semibold bg-[#F2A900] text-[#0B0C10] px-4 py-2 rounded-lg hover:bg-[#D49500] transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
