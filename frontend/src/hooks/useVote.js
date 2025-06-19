import { toast } from "react-hot-toast";

export function useVote() {
  const token = localStorage.getItem("token");
  const guestId = localStorage.getItem("guestId"); // if using guest ID

  return async function vote(ideaId, type) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/votes/${ideaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            voteType: type,
            ...(guestId && !token ? { guestId } : {}),
          }),
        }
      );

      if (res.status === 409) {
        toast.error("You already voted.");
        return null;
      }

      if (!res.ok) {
        toast.error("Vote failed.");
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error("Vote error:", err);
      toast.error("Vote failed due to network error.");
      return null;
    }
  };
}
