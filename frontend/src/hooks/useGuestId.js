import { useState } from "react";

export function useGuestId() {
  const [guestId] = useState(() => {
    let existing = localStorage.getItem("guestId");
    if (!existing) {
      existing = crypto.randomUUID();
      localStorage.setItem("guestId", existing);
    }
    return existing;
  });

  return guestId;
}
