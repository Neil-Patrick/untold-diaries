/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Turnstile from "react-turnstile";
import Form from "next/form";
import Background from "@/components/background/Background";
import { LinearGradient } from "react-text-gradients";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CatYapper from "@/components/CatYapper";
import gif from "@/components/gif_1.gif";
type Artist = {
  name: string;
};

type Track = {
  id: string;
  name: string;
  artists: Artist[];
  image: string;
};

type OptionType = {
  value: string;
  label: string;
  track: Track;
};

export default function Submit() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<OptionType | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim() || !message.trim()) {
      setSubmitError("Please fill in the recipient and the message.");
      return;
    }
    if (!captcha) {
      setSubmitError("Please complete the captcha check first.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          from,
          captcha,
          track: selectedTrack ? selectedTrack.track.id : null,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.id) {
        setSubmitError(data.error || "Couldn't share your story. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.href = `/view?id=${data.id}`;
    } catch {
      setSubmitError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Background />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 items-start gap-10 px-4 sm:px-8 pb-10 mt-4 lg:mt-10 bg-transparent">
        <div className="order-2 lg:order-1 w-full">
          <Form
            action="/submit"
            className="mx-auto w-full max-w-xl p-5 sm:p-8 bg-[#ffffff08] rounded-3xl shadow text-white"
          >
            <h1 className="mt-4 sm:mt-8 mb-10 flex items-center justify-center text-center text-3xl sm:text-4xl font-extrabold font-secondary">
              Let&apos;s Connect!
            </h1>
            <div className="-mt-7 mb-12 text-center opacity-65">
              Let&apos;s align our constellations! Reach out and let the magic of
              sounds found their way home!
            </div>
            <input
              id="to"
              name="to"
              placeholder="Enter recipient"
              className="block w-full mb-10 p-2 border rounded bg-[#ffffff11] border-[#ffffff50] font-tertiary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              id="message"
              name="message"
              placeholder="Enter message"
              className="block w-full mb-10 p-2 border rounded bg-[#ffffff11] border-[#ffffff50] resize-none font-tertiary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input
              id="from"
              name="from"
              placeholder="Enter from (optional)"
              className="block w-full mb-4 p-2 border rounded bg-[#ffffff11] border-[#ffffff50] font-tertiary"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <SearchBar setSelected={setSelectedTrack} />

            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onVerify={(token) => setCaptcha(token)}
              className="pb-5"
            />

            {submitError && (
              <p role="alert" className="mb-4 text-center text-sm text-red-400 font-tertiary">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full p-3 font-tertiary rounded bg-gradient-to-r from-[#763AF5] to-[#A604F2] hover:from-[#a888f5] hover:to-[#b238f8] transition-colors duration-300 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Sharing..." : "Share Your Story"}
              <i className="ml-3 fa-solid fa-shuttle-space"></i>
            </button>
          </Form>
        </div>

        <div className="order-1 lg:order-2 flex flex-col items-center text-center text-white lg:sticky lg:top-10">
          <div className="font-black font-secondary text-4xl sm:text-5xl xl:text-7xl">
            <LinearGradient gradient={["to right", "#4F24B4, #999999"]}>
              Untold Diaries
            </LinearGradient>
          </div>
          <div className="mt-4 font-secondary text-base sm:text-lg font-light">
            Stay anonymous - No names. No judgements.
            <br />
            Just untold truths and stories.
          </div>
          <div className="mt-6 lg:mt-12 w-full">
            <CatYapper text={message} />
          </div>
          <div className="mt-4">
            <img
              src={gif.src}
              alt="Animated GIF"
              className="w-48 sm:w-64 lg:w-96 xl:w-[30rem] h-auto"
            />
          </div>
        </div>
      </div>
    </>
  );
}