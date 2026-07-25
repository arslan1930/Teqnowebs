"use client";

import Image from "next/image";
import { useState } from "react";
import { memberInitials } from "@/data/team";

type MemberAvatarProps = {
  name: string;
  photo?: string | null;
  photoAlt?: string | null;
};

export function MemberAvatar({ name, photo, photoAlt }: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photo) && !failed;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-accent/20 bg-white shadow-sm sm:h-28 sm:w-28">
        {showPhoto ? (
          <Image
            src={photo!}
            alt={photoAlt || name}
            fill
            className="object-cover"
            sizes="112px"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center font-display text-xl font-semibold text-accent-deep sm:text-2xl"
            aria-hidden
          >
            {memberInitials(name)}
          </span>
        )}
      </div>
      <p className="font-display mt-3 text-base font-semibold text-ink">{name}</p>
    </div>
  );
}
