'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';

/* ------------------------------------------------------------------
 * Types that roughly mirror your Offer schema (client‑side)
 * ------------------------------------------------------------------ */
export interface FAQItem {
  question: string;
  answer: string;
  _id?: string;
}

export interface Offer {
  _id: string;
  bannerImage: string;
  offerStartTime: string;   // ISO string from API
  offerEndTime: string;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: FAQItem[];
  termsAndConditions: string;
  service: {
    _id: string;
    name?: string;
    serviceName?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;       // virtual from API if enabled
}

interface OfferContextValue {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refreshOffers: () => Promise<void>;                 // exposed in case you want a manual refresh
  addOffer: (fd: FormData) => Promise<Offer | null>;
  updateOffer: (id: string, fd: FormData) => Promise<Offer | null>;
  deleteOffer: (id: string) => Promise<void>;
}

const OfferContext = createContext<OfferContextValue | null>(null);

export function OfferProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = '/api/offer';

  /* ---------------- fetch all offers ---------------- */
  const refreshOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ success: boolean; data: Offer[] }>(`${API_BASE}/all`);
      setOffers(res.data.data ?? []);
    } catch (err: unknown) {
      console.error('Error fetching offers:', err);
      setError('Failed to fetch offers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOffers();
  }, [refreshOffers]);

  /* ---------------- add ---------------- */
  const addOffer = useCallback(
    async (fd: FormData): Promise<Offer | null> => {
      try {
        const res = await axios.post<{ success: boolean; data: Offer }>(API_BASE, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // optimistic: prepend
        const newOffer = res.data.data;
        setOffers((prev) => [newOffer, ...prev]);
        return newOffer;
      } catch (err) {
        console.error('Error adding offer:', err);
        // fallback: full refresh (in case partial update fails)
        refreshOffers();
        return null;
      }
    },
    [refreshOffers],
  );

  /* ---------------- update ---------------- */
  const updateOffer = useCallback(
    async (id: string, fd: FormData): Promise<Offer | null> => {
      try {
        const res = await axios.put<{ success: boolean; data: Offer }>(
          `${API_BASE}/${id}`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        const updated = res.data.data;
        setOffers((prev) => prev.map((o) => (o._id === id ? updated : o)));
        return updated;
      } catch (err) {
        console.error('Error updating offer:', err);
        refreshOffers();
        return null;
      }
    },
    [refreshOffers],
  );

  /* ---------------- delete ---------------- */
  const deleteOffer = useCallback(
    async (id: string): Promise<void> => {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        setOffers((prev) => prev.filter((o) => o._id !== id));
      } catch (err) {
        console.error('Error deleting offer:', err);
        refreshOffers();
      }
    },
    [refreshOffers],
  );

  const value: OfferContextValue = {
    offers,
    loading,
    error,
    refreshOffers,
    addOffer,
    updateOffer,
    deleteOffer,
  };

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

/* ---------------- hook ---------------- */
export function useOffer() {
  const ctx = useContext(OfferContext);
  if (!ctx) {
    throw new Error('useOffer must be used within an OfferProvider');
  }
  return ctx;
}
