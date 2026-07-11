import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useToast } from "../../components/providers/toast/ToastProvider";
import { apiClient } from "../../lib/apiClient";
import { getErrorMessage } from "../../lib/httpErrors";
import SessionShell from "../../components/session/SessionShell";
import { sessionLocationSchema } from "../../lib/schemas/sessionLocationSchema";
import type { SessionData } from "../../types";
import ChatMessage from "../../components/message/ChatMessage";

const Session = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const prefetch = useMemo(() => {
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, [location.state]);
  const [session, setSession] = useState<SessionData | null>(prefetch);
  useEffect(() => {
    if (prefetch) return;
    setSession(null);
    if (!id) return;
    let ignore = false;
    const fetchSession = async () => {
      try {
        const res = await apiClient.sessions[":id"].$get({
          param: {
            id,
          },
        });
        if (ignore) return;
        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }
        setSession(await res.json());
      } catch (error) {
        if (ignore) return;
        toast.show({
          variant: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to Load Session",
        });
        navigate("/", { replace: true });
      }
    };
    fetchSession();
    return () => {
      ignore = true;
    };
  }, [id, prefetch, toast, navigate]);
  if (!session) {
    return <SessionShell onSubmit={() => {}} inputDisabled loading />;
  }
  return (
    <SessionShell onSubmit={() => {}} inputDisabled>
      {session.messages.map((msg) => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
    </SessionShell>
  );
};
export default Session;
