import { useApi } from "@/hooks/useApi";
import { toast } from "react-hot-toast";

export function useVote() {
  const api = useApi();
  const guestId = localStorage.getItem("guestId");

  return async function vote(ideaId, type) {
    try {
      const payload = {
        voteType: type,
        ...(guestId && !localStorage.getItem("token") ? { guestId } : {}),
      };

      const res = await api.post(`/api/votes/${ideaId}`, payload);
      return res.data;
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("You already voted.");
      } else {
        toast.error("Vote failed.");
      }

      console.error("Vote error:", err);
      return null;
    }
  };
}
