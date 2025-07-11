// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// type User = {
//   _id: string;
//   fullName: string;
//   email: string;
//   mobileNumber: string;
// };

// type LiveWebinars = {
//   _id: string;
//     name: string;
//     description: string;
//     imageUrl: string;
//     displayVideoUrls: string;
//     date: string;
//     startTime: string;
//     endTime: string;
//     isDeleted: boolean;
//     createdAt: string;
//     updatedAt?: string;
//     __v?: number;

//      user?: User[]; // ✅ Correct
//   users?: string[];
// };

// interface LiveWebinarsContextType {
//   webinars: LiveWebinars[];
//   addWebinar: (formData: FormData) => Promise<void>;
//   updateWebinar: (id: string, formData: FormData) => Promise<void>;
//   updateTutorial: (id: string, formData: FormData) => Promise<void>;
//   deleteWebinar: (id: string) => Promise<void>;
//   deleteTutorial: (id: string, videoIndex: number) => Promise<void>;
// }

// const LiveWebinarsContext = createContext<LiveWebinarsContextType | null>(null);

// export const LiveWebinarsProvider = ({ children }: { children: React.ReactNode }) => {
//   const [webinars, setWebinars] = useState<LiveWebinars[]>([]);

//   // Fetch webinars from the API
//   const fetchWebinars = async () => {
//     try {
//       const response = await axios.get("/api/academy/livewebinars");
//       setWebinars(response.data.data);
//     } catch (error) {
//       console.error("Error fetching webinars:", error);
//     }
//   };

//   // Fetch webinars when the component mounts
//   useEffect(() => {
//     fetchWebinars();
//   }, []);

//   // Add new webinar to the system
//   const addWebinar = async (formData: FormData) => {
//     try {
//       await axios.post("/api/academy/livewebinars", formData);
//       fetchWebinars();  // Re-fetch webinars after adding a new one
//     } catch (error) {
//       console.error("Error adding webinars:", error);
//     }
//   };

//   // Update existing webinar
//   const updateWebinar = async (id: string, formData: FormData) => {
//     try {
//       await axios.put(`/api/academy/livewebinars/${id}`, formData);
//       fetchWebinars();  // Re-fetch webinars after updating one
//     } catch (error) {
//       console.error("Error updating webinars:", error);
//     }
//   };

//   const updateTutorial = async (id: string, formData: FormData) => {
//     try {
//       await axios.put(`/api/academy/livewebinars/${id}`, formData);
//        fetchWebinars(); // Re-fetch webinars after updating one
//     } catch (error) {
//       console.error("Error updating webinars:", error);
//     }
//   };

//    const deleteTutorial = async (id: string) => {
//     try {
//       await axios.delete(`/api/academy/livewebinars/${id}`);
//         fetchWebinars(); // Re-fetch webinars after deleting one
//     } catch (error) {
//       console.error("Error deleting webinars:", error);
//     }
//   };

//   // Delete a webinar by ID
//   const deleteWebinar = async (id: string) => {
//     try {
//       await axios.delete(`/api/academy/livewebinars/${id}`);
//       fetchWebinars();  // Re-fetch webinars after deleting one
//     } catch (error) {
//       console.error("Error deleting webinars:", error);
//     }
//   };

//   return (
//     <LiveWebinarsContext.Provider value={{ webinars, addWebinar, updateWebinar, updateTutorial, deleteTutorial, deleteWebinar }}>
//       {children}
//     </LiveWebinarsContext.Provider>
//   );
// };

// // Custom hook to use webinars context
// export const useLiveWebinars = () => {
//   const context = useContext(LiveWebinarsContext);
//   if (!context) {
//     throw new Error("useLiveWebinars must be used within a LiveWebinarsProvider");
//   }
//   return context;
// };






// src/context/LiveWebinarContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type User = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
};

type LiveWebinars = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  displayVideoUrls: string[];
  date: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  user?: User[];     // Populated user details
  users?: string[];  // Raw user IDs
};

interface LiveWebinarsContextType {
  webinars: LiveWebinars[];
  addWebinar: (formData: FormData) => Promise<void>;
  updateWebinar: (id: string, formData: FormData) => Promise<void>;
  updateTutorial: (id: string, formData: FormData) => Promise<void>;
  deleteWebinar: (id: string) => Promise<void>;
  deleteTutorial: (id: string) => Promise<void>;
  fetchWebinarById: (id: string) => Promise<LiveWebinars | null>;
   updateEnrollment:(id: string,userId:string,status:boolean ) => Promise<void>;
}

const LiveWebinarsContext = createContext<LiveWebinarsContextType | null>(null);

export const LiveWebinarsProvider = ({ children }: { children: React.ReactNode }) => {
  const [webinars, setWebinars] = useState<LiveWebinars[]>([]);

  const fetchWebinars = async () => {
    try {
      const response = await axios.get("/api/academy/livewebinars");
      setWebinars(response.data.data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    }
  };

  
  const fetchWebinarById = async (id: string) => {
  try {

     const res = await axios.get(`/api/academy/livewebinars/${id}`);
    console.log("Fetched webinar data:", res.data);
    return res.data.data; // Make sure your API returns `{ webinar: { ... } }`
  } catch (err) {
    console.error("Error fetching webinar:", err);
    return null;
  }
};


  useEffect(() => {
    fetchWebinars();
  }, []);

  const addWebinar = async (formData: FormData) => {
    try {
      await axios.post("/api/academy/livewebinars", formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error adding webinar:", error);
    }
  };

  const updateWebinar = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/livewebinars/${id}`, formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error updating webinar:", error);
    }
  };

  const updateTutorial = async (id: string, formData: FormData) => {
    try {
      await axios.put(`/api/academy/livewebinars/${id}`, formData);
      fetchWebinars();
    } catch (error) {
      console.error("Error updating tutorial:", error);
    }
  };

  const deleteTutorial = async (id: string) => {
    try {
      await axios.delete(`/api/academy/livewebinars/${id}`);
      fetchWebinars();
    } catch (error) {
      console.error("Error deleting tutorial:", error);
    }
  };

  const deleteWebinar = async (id: string) => {
    try {
      await axios.delete(`/api/academy/livewebinars/${id}`);
      fetchWebinars();
    } catch (error) {
      console.error("Error deleting webinar:", error);
    }
  };

  const updateEnrollment = async (webinarId: string, userId: string, status: boolean) => {
  try {
    await axios.put(`/api/academy/livewebinars/enroll/${webinarId}`, { userId, status });
    fetchWebinars();
  } catch (error) {
    console.error("Error updating enrollment:", error);
  }
};


  return (
    <LiveWebinarsContext.Provider
      value={{
        webinars,
        addWebinar,
        updateWebinar,
        updateTutorial,
        deleteTutorial,
        deleteWebinar,
        fetchWebinarById,
        updateEnrollment
      }}
    >
      {children}
    </LiveWebinarsContext.Provider>
  );
};

export const useLiveWebinars = () => {
  const context = useContext(LiveWebinarsContext);
  if (!context) {
    throw new Error("useLiveWebinars must be used within a LiveWebinarsProvider");
  }
  return context;
};
