"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Coordinate type
export interface ICoordinate {
  lat: number;
  lng: number;
}

// Zone type matching your Mongoose schema
interface IZone {
  _id: string;
  name: string;
  coordinates: ICoordinate[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

// Context type
interface ZoneContextType {
  zones: IZone[];
  addZone: (zone: { name: string; coordinates: ICoordinate[] }) => Promise<void>;
  updateZone: (id: string, zone: { name: string; coordinates: ICoordinate[] }) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
}

const ZoneContext = createContext<ZoneContextType | null>(null);

export const ZoneProvider = ({ children }: { children: React.ReactNode }) => {
  const [zones, setZones] = useState<IZone[]>([]);

  // Fetch all zones
  const fetchZones = async () => {
    try {
      const response = await axios.get("/api/zone");
      setZones(response.data.data);
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Add a new zone
  const addZone = async (zone: { name: string; coordinates: ICoordinate[] }) => {
    try {
      await axios.post("/api/zone", zone);
      fetchZones();
    } catch (error) {
      console.error("Error adding zone:", error);
    }
  };

  // Update a zone
  const updateZone = async (id: string, zone: { name: string; coordinates: ICoordinate[] }) => {
    try {
      await axios.put(`/api/zone/${id}`, zone);
      fetchZones();
    } catch (error) {
      console.error("Error updating zone:", error);
    }
  };

  // Delete a zone
  const deleteZone = async (id: string) => {
    try {
      await axios.delete(`/api/zone/${id}`);
      fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  return (
    <ZoneContext.Provider value={{ zones, addZone, updateZone, deleteZone }}>
      {children}
    </ZoneContext.Provider>
  );
};

// Hook for easy context usage
export const useZone = () => {
  const context = useContext(ZoneContext);
  if (!context) {
    throw new Error("useZone must be used within a ZoneProvider");
  }
  return context;
};
