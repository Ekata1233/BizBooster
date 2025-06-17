"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ServiceManContext = createContext<any>(null);

export const ServiceManProvider = ({ children }: { children: React.ReactNode }) => {
  const [serviceMen, setServiceMen] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServiceMen = async () => {
    setLoading(true);
    const res = await fetch("/api/serviceman");
    const data = await res.json();
    setServiceMen(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceMen();
  }, []);

  return (
    <ServiceManContext.Provider value={{ serviceMen, fetchServiceMen, loading }}>
      {children}
    </ServiceManContext.Provider>
  );
};

export const useServiceMan = () => useContext(ServiceManContext);
