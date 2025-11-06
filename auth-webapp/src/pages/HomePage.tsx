import React, { useState } from 'react';
import { fetchMessage } from '../api/client';
import { MessageCard } from '../components/MessageCard';

export const HomePage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const msg = await fetchMessage();
      setMessage(msg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Hello World!</h1>
        <button
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Message'}
        </button>

        {error && <p>{error}</p>}
        {message && <div><MessageCard message={message} /></div>}
      </div>
    </div>
  );
};
