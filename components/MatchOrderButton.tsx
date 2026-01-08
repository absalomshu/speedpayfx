'use client';

import { useState } from 'react';

export default function MatchOrderButton({ orderId, initialStatus }: { orderId: string; initialStatus: 'OPEN' | 'MATCHED' }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/match`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Unable to match order');
      }
      setStatus('MATCHED');
      setMessage('You are now connected with a partner. We will finalize details shortly.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'MATCHED') {
    return (
      <div className="card flex flex-col gap-2 p-5 text-center">
        <p className="text-lg font-bold text-midnight">You are now connected.</p>
        <p className="text-sm text-midnight/70">{message || 'We will coordinate the exchange with both parties.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <button
        onClick={handleMatch}
        disabled={loading}
        className="btn w-full text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Connecting...' : 'Match this order'}
      </button>
    </div>
  );
}
