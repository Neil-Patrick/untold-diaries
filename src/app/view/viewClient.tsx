'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Background from "@/components/background/Background";

type Submission = {
  id: number;
  name: string;
  message: string;
  from: string;
  track: string;
};

const ViewClient = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/view-details?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Submission not found");
        return res.json();
      })
      .then((data) => {
        setSubmission(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setSubmission(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const status = (text: string, className = "text-gray-300") => (
    <p className={`px-4 py-20 text-center font-tertiary ${className}`}>{text}</p>
  );

  if (!id) return status("No ID provided in URL");
  if (loading) return status("Loading...");
  if (error) return status(error, "text-red-400");
  if (!submission) return status("No submission found.");

  return (
    <>
      <Background />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 pt-6 lg:pt-12 pb-20 text-white">
        <p className="font-tertiary text-xl break-words">
          <strong>How are you, </strong> {submission.name} <strong className="font-light">?</strong>
        </p>
        <p className="font-tertiary text-gray-400">
          Here&apos;s a song and message someone thought you might appreciate :)
        </p>

        <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-10 items-center">
          <div className="flex flex-col">
            <div className="flex min-h-[12rem] lg:min-h-[24rem] items-center justify-center p-2 sm:p-4 text-lg">
              <p className="w-full whitespace-pre-wrap break-words text-center font-tertiary font-medium leading-7">
                {submission.message}
              </p>
            </div>
            {submission.from && (
              <p className="mt-2 self-end font-tertiary break-words">
                <strong>It&apos;s me, </strong> {submission.from} <strong>.</strong>
              </p>
            )}
          </div>

          {submission.track && (
            <iframe
              title="Spotify player"
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${submission.track}?utm_source=generator`}
              className="w-full"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          )}
        </div>
      </main>
    </>
  );
};

export default ViewClient;
