// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import axios from 'axios';

// interface SupportEntry {
//   _id: string;
//   question: string;
//   answer: string;
//   createdAt: string;
//   user?: {
//     fullName: string;
//     email: string;
//   };
// }

// const HelpSupportChatPage = () => {
//   const { id } = useParams();
//   const [chat, setChat] = useState<SupportEntry | null>(null);

//   useEffect(() => {
//     if (!id) return;

//     const fetchChat = async () => {
//       try {
//         const res = await axios.get(`/api/support/question/${id}`);
//         setChat(res.data.data);
//       } catch (err) {
//         console.error('Failed to fetch chat:', err);
//       }
//     };

//     fetchChat();
//   }, [id]);

//   if (!chat) return <p className="p-4">Loading chat...</p>;

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-6">
//       <h1 className="text-2xl font-bold">Support Chat</h1>

//       <div className="bg-gray-50 p-4 rounded-md border">
//         <p><strong>User Name:</strong> {chat.user?.fullName || 'N/A'}</p>
//         <p><strong>Email:</strong> {chat.user?.email || 'N/A'}</p>
//         <p><strong>Date:</strong> {new Date(chat.createdAt).toLocaleString()}</p>
//       </div>

//       <div className="space-y-4">
//         <div className="bg-blue-100 p-4 rounded shadow">
//           <p className="font-semibold text-blue-900">Q:</p>
//           <p className="text-gray-800">{chat.question}</p>
//         </div>

//         <div className="bg-green-100 p-4 rounded shadow">
//           <p className="font-semibold text-green-900">A:</p>
//           <p className="text-gray-800">{chat.answer || 'Not answered yet'}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HelpSupportChatPage;



'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface SupportEntry {
    _id: string;
    question: string;
    answer: string;
    createdAt: string;
    user?: {
        fullName: string;
        email: string;
    };
}

const HelpSupportChatPage = () => {
    const { id: userId } = useParams();
    const [chats, setChats] = useState<SupportEntry[]>([]);

    useEffect(() => {
        if (!userId) return;
        console.log("userId new :", userId)
        const fetchChats = async () => {
            try {
                const res = await axios.get(`/api/support/answer/${userId}`);
                console.log('data :', res.data.data)
                setChats(res.data.data);
            } catch (err) {
                console.error('Failed to fetch chats:', err);
            }
        };

        fetchChats();
    }, [userId]);

    if (!chats.length) return <p className="p-4">No chats available.</p>;

    const user = chats[0]?.user;

    return (
        <div className="max-w-8xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-6">
            <h1 className="text-2xl font-bold">Support Chat</h1>

            <div className="bg-gray-50 p-4 rounded-md border">
                <p><strong>User Name:</strong> {user?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>

           


            <div className="space-y-6">
                {chats.map((entry, ) => (
                    <div key={entry._id} className="space-y-2 pt-2">

                        {/* Question (left aligned) */}
                        <div className="flex justify-start">
                            <div className="bg-blue-100 p-3 max-w-xs rounded-lg shadow text-left">
                                <p className="font-semibold text-blue-900">Q:</p>
                                <p className="text-gray-800">{entry.question}</p>
                            </div>
                        </div>

                        {/* Answer (right aligned) */}
                        {entry.answer && (
                            <div className="flex justify-end">
                                <div className="bg-green-100 p-3 max-w-xs rounded-lg shadow text-right">
                                    <p className="font-semibold text-green-900">A:</p>
                                    <p className="text-gray-800">{entry.answer}</p>
                                </div>
                            </div>
                        )}

                        {/* Timestamp (bottom right) */}
                        <p className="text-xs text-gray-500 text-right">
                            {new Date(entry.createdAt).toLocaleString()}
                        </p>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default HelpSupportChatPage;
