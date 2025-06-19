import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useGuestId() {
  const [guestId, setGuestId] = useState(() => {
    let existing = localStorage.getItem("guestId");
    if (!existing) {
      existing = uuidv4();
      localStorage.setItem("guestId", existing);
    }
    return existing;
  });

  return guestId;
}
