import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        setError("Authorization code not found in callback URL");
        return;
      }

      try {
        const body = JSON.stringify({
          redirect_uri: REDIRECT_URI,
          code,
        });
        const res = await fetch(`${API_BASE_URL}/exchange-code`, {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });

         if (!res.ok) {
          const text = await res.text();
          throw new Error(`Token exchange failed: ${res.status} ${text}`);
        }

        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      }
    };

    fetchTokens();
  }, [navigate]);

  if (error) {
    return <div>Error during sign-in: {error}</div>;
  }

  return <div>Signing you in...</div>;
};

export default Callback;
