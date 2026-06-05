"use client";

import { useEffect, useState, useRef } from "react";

interface TerminalTypingProps {
  lines?: string[];
  className?: string;
  /** Per-character typing speed in ms (lower = faster). */
  typingSpeed?: number;
  /** Fired once all lines have finished typing. */
  onComplete?: () => void;
}

const defaultLines = [
  "> Analyzing career profile...",
  "> Role: Product Manager",
  "> Seniority: Mid-Level",
  "> Interests: AI Tools, Product Strategy",
  "> Generating personalized briefing...",
  "> Scanning 50+ sources...",
  "> ✓ Your Daily Download is ready",
];

export default function TerminalTyping({
  lines = defaultLines,
  className = "",
  typingSpeed = 30,
  onComplete,
}: TerminalTypingProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onComplete?.();
      const blinkInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(blinkInterval);
    }

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          if (updated.length <= currentLineIndex) {
            updated.push(currentLine.slice(0, currentCharIndex + 1));
          } else {
            updated[currentLineIndex] = currentLine.slice(
              0,
              currentCharIndex + 1
            );
          }
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, lines, typingSpeed, onComplete]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, [currentLineIndex, lines.length]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-white/[0.08] bg-[#0D1117] overflow-hidden shadow-2xl ${className}`}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-[#8A91A0] font-mono">
          my-daily-download — profile-analysis
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-6 font-mono text-sm min-h-[240px]">
        {displayedLines.map((line, i) => (
          <div
            key={i}
            className={`mb-2 ${
              line.startsWith("> ✓")
                ? "text-emerald-400"
                : line.startsWith("> Role:") ||
                    line.startsWith("> Seniority:") ||
                    line.startsWith("> Interests:")
                  ? "text-[#F2A900]"
                  : "text-[#E6E8EE]"
            }`}
          >
            {line}
            {i === currentLineIndex && currentLineIndex < lines.length && (
              <span
                className={`inline-block w-2 h-4 ml-0.5 align-middle bg-[#F2A900] transition-opacity duration-100 ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>
        ))}
        {currentLineIndex >= lines.length && (
          <div className="text-emerald-400">
            {displayedLines[displayedLines.length - 1]}
            <span
              className={`inline-block w-2 h-4 ml-0.5 align-middle bg-[#F2A900] transition-opacity duration-100 ${
                showCursor ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
