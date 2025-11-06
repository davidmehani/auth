// src/pages/Callback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

interface TokenResponse {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

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
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code,
        });

        const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Token exchange failed: ${res.status} ${text}`);
        }

        const data: TokenResponse = await res.json();
        
        localStorage.setItem("id_token", data.id_token);
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
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
