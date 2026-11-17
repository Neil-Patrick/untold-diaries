/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Card from "@/components/Card";
import { withTrackInfo } from "@/lib/tracks";

interface Item {
  id: string;
  name?: string;
  message?: string;
  trackName?: string;
  trackImage?: string;
}

const Carousel = () => {
  const [rows, setRows] = useState<Item[][]>([[], []]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel-items?limit=30`);
        const data = await res.json();

        const enhanced = await withTrackInfo(data);

        // Split into two rows
        const row1: Item[] = [], row2: Item[] = [];
        enhanced.forEach((item: Item, idx: number) => {
          (idx % 2 === 0 ? row1 : row2).push(item);
        });

        setRows([
          [...row1, ...row1, ...row1],
          [...row2, ...row2, ...row2],
        ]);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <div className="space-y-4 overflow-hidden max-w-screen-xl w-full px-4">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`flex w-max animate-scroll ${
              idx % 2 === 0 ? "animate-scroll-left" : "animate-scroll-right"
            }`}
          >
            {row.map((item, i) => (
              <div key={`${item.id}-${i}`} className="mr-4">
                <Card
                  id={item.id}
                  name={item.name}
                  message={item.message}
                  trackName={item.trackName}
                  trackImage={item.trackImage}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default Carousel;
