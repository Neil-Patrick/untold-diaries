import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { debounce } from "lodash";

type CatYapperProps = {
  text: string;
};

// Shown while the message box is empty; no AI request needed for these.
const IDLE_LINES = [
  "😺 Hey hooman, type something... don't keep me waiting.",
  "😼 I'm still here... watching... waiting... judging...",
  "😾 You're really gonna make me wait? I'm getting hissy.",
  "😹 Do you type with your paws or what? So slooow!",
  "🐾 The keyboard is your litter box now. Use it!",
];

// Wait this long after the last keystroke before asking the AI, and skip
// very short drafts, so the free OpenRouter quota isn't burned on every key.
const REPLY_DELAY_MS = 2000;
const MIN_LENGTH_FOR_REPLY = 8;

const CatYapper = ({ text }: CatYapperProps) => {
  const [catTalks, setCatTalks] = useState(IDLE_LINES[0]);
  const [displayText, setDisplayText] = useState("");
  const lastAskedRef = useRef("");

  const askCat = useMemo(
    () =>
      debounce(async (draft: string) => {
        if (draft === lastAskedRef.current) return;
        lastAskedRef.current = draft;
        try {
          const res = await fetch("/api/cat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: draft }),
          });
          const data = await res.json();
          if (data.catYap) setCatTalks(data.catYap);
        } catch (err) {
          console.error("Cat request failed:", err);
        }
      }, REPLY_DELAY_MS),
    []
  );

  useEffect(() => () => askCat.cancel(), [askCat]);

  useEffect(() => {
    const draft = text.trim();

    if (draft === "") {
      askCat.cancel();
      lastAskedRef.current = "";
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % IDLE_LINES.length;
        setCatTalks(IDLE_LINES[i]);
      }, 6000);
      return () => clearInterval(interval);
    }

    if (draft.length >= MIN_LENGTH_FOR_REPLY) askCat(draft);
  }, [askCat, text]);

  useEffect(() => {
    let index = 0;
    let interval: NodeJS.Timeout;

    const deleteThenType = () => {
      interval = setInterval(() => {
        setDisplayText((prev) => {
          if (prev.length === 0) {
            clearInterval(interval);
            typeNewText();
            return "";
          }
          // Array.from splits by character, so emojis aren't cut in half.
          return Array.from(prev).slice(0, -1).join("");
        });
      }, 30);
    };

    const typeNewText = () => {
      // Split by character (not UTF-16 unit) so emojis like 🐾 stay whole.
      const chars = Array.from(catTalks);
      index = 0;
      interval = setInterval(() => {
        if (index >= chars.length) {
          clearInterval(interval);
          return;
        }
        const nextChar = chars[index];
        index++;
        setDisplayText((prev) => prev + nextChar);
      }, 50);
    };

    deleteThenType();

    return () => clearInterval(interval);
  }, [catTalks]);

  return (
    <div className="text-lg text-purple-500 italic font-bold tracking-wide mt-4 transition-all duration-300 font-tertiary max-w-xl mx-auto px-4 text-center whitespace-pre-wrap">
      &quot; {displayText}<span className="animate-pulse">|</span> &quot;
    </div>
  );
};

export default CatYapper;
