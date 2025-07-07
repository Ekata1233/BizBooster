'use client';

import React, { useState } from 'react';
import { usePckCommsion } from '@/context/PckCommsionContext';

export default function PckCommsionForm() {
  const { pckcommsion, savePckCommsion, loading } = usePckCommsion();

  const [level1, setLevel1] = useState(pckcommsion?.level1Commission || 0);
  const [level2, setLevel2] = useState(pckcommsion?.level2Commission || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePckCommsion({ level1Commission: level1, level2Commission: level2 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Level 1 Commission:</label>
        <input type="number" value={level1} onChange={(e) => setLevel1(Number(e.target.value))} />
      </div>
      <div>
        <label>Level 2 Commission:</label>
        <input type="number" value={level2} onChange={(e) => setLevel2(Number(e.target.value))} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
