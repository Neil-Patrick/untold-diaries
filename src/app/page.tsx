"use client";

import Background from "@/components/background/Background";
import Link from "next/link";
import { LinearGradient } from "react-text-gradients";
import Carousel from "@/components/carousel/Carousel"

export default function Home() {
  return (
    <>
      <Background />
      <div className="relative flex flex-col lg:flex-row lg:min-h-[calc(100vh-8rem)] items-center justify-between gap-12 px-4 sm:px-8 lg:px-16 xl:px-24 py-8 lg:py-0 bg-transparent overflow-hidden">
        <div className="z-10 w-full lg:max-w-xl xl:max-w-3xl space-y-8 md:space-y-10 lg:-mt-25">
          <div className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-primary justify-center text-center text-white leading-snug">
            <LinearGradient gradient={["to right", "#FFFFFF, #4F24B4"]}>
              No names. No judgements.
              <br />
            </LinearGradient>
            <LinearGradient gradient={["to right", "#FFFFFF, #4F24B4"]}>
              Just untold truths.
            </LinearGradient>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 xl:gap-10">
            <div className="relative flex group">
              <div className="absolute transitiona-all duration-1000 opacity-0 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-40 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
              <Link
                href="/submit"
                title="Share your story"
                className="w-full sm:w-64 xl:w-80 h-16 md:h-20 font-lugrasimo relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-500 rounded-xl backdrop-blur-md bg-[#4F24B4] hover:bg-[#0A0D17] border border-[#4F24B4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF44EC]"
                role="button"
              >
                Share Your Story!
              </Link>
            </div>
            <div className="relative flex group">
              <div className="absolute transitiona-all duration-1000 opacity-0 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-40 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
              <Link
                href="/browse"
                title="Share your story"
                className="w-full sm:w-64 xl:w-80 h-16 md:h-20 font-lugrasimo relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-500 rounded-xl backdrop-blur-md bg-[#0A0D17] hover:bg-[#4F24B4] border border-[#4F24B4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF44EC]"
                role="button"
              >
                Browse Stories!
              </Link>
            </div>
          </div>

          
          
        </div>
            <div className="relative z-10 lg:-mt-25 flex justify-center lg:justify-end items-center w-full lg:w-auto lg:flex-1 min-w-0 min-h-[300px]">
                <div className="relative p-4 sm:p-6 sm:pr-0 rounded-xl bg-[#0A0D17]/10 backdrop-blur-md w-full max-w-4xl overflow-hidden">
                    <Carousel />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#0A0D17]">
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#0A0D17]">
                  </div>

                </div>
            </div>    



      </div>
    </>
  );
}
