import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Footer() {
  const ref = useScrollReveal({ y: 10, duration: 0.4 });

  return (
    <footer
      ref={ref}
      className="w-full border-t border-white/[0.08] bg-[#0B0C10] py-12 px-4"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#7A8194]">
            <span className="font-bold text-[#E0E2E8]">My Daily Download</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#/privacy"
              className="text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
            >
              Privacy
            </a>
            <a
              href="#/terms"
              className="text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
            >
              Terms
            </a>
            <a
              href="mailto:support@mydailydownload.com"
              className="text-sm text-[#7A8194] hover:text-[#E0E2E8] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        <p className="text-xs text-[#7A8194]/50 text-center">
          Made for professionals who move fast.
        </p>
      </div>
    </footer>
  );
}
