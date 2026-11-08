"use client";

import { getNameInitials } from "@/components/shared/UserAvatar";
import { useState } from "react";

type TEvent = {
  id: string;
  name: string;
  date: string;
  image: string;
};

export default function EventCard({ event }: { event: TEvent }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = !event.image || imageError;

  return (
    <div>
      <div className='flex justify-between items-center border border-[#FFFFFF33]/[0.2] rounded-2xl p-2'>
        <div className='flex gap-x-3 items-center'>
          {showFallback ? (
            <div className='size-[60px] rounded bg-[#FCB806]/20 text-[#FCB806] flex items-center justify-center text-lg font-semibold shrink-0'>
              {getNameInitials(event.name)}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt={event.name}
              className='rounded size-[60px] object-cover shrink-0'
              onError={() => setImageError(true)}
            />
          )}
          <div className='flex flex-col justify-between'>
            <h5 className='text-[#F6F6F6] lg:text-lg font-semibold'>{event.name}</h5>
            <p className='text-[#CBD5E1]'>{event.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
