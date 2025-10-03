'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
import { Send } from 'lucide-react';

interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  question: string;
  answer?: string;
  createdAt: string;
}

const SupportPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  const [conversation, setConversation] = useState<UserQuery[]>([]);
  const [message, setMessage] = useState('');

  // Fetch only this user's queries
  useEffect(() => {
    const fetchConversation = async () => {
      if (!userId) return;

      try {
        const res = await axios.get<{ data: UserQuery[] }>(
          `/api/support/question/${userId}`

        );
        console.log("responce", res);

        setConversation(res.data.data || []);
      } catch (error) {
        console.error('Error fetching user conversation:', error);
      }
    };

    fetchConversation();
  }, [userId]);
  console.log("conv", conversation);
  console.log("userid", userId);

  // Send reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || conversation.length === 0) return;

    const lastQuery = conversation[conversation.length - 1];

    console.log("lastqueerfdfdfd fdfd : ", lastQuery)

    try {
      const res = await axios.post('/api/support/answer', {
        supportId: lastQuery._id, // reply to last question
        question: lastQuery.question,
        answer: message,
      });

      if (res.data?.success) {
        // Update local state
        setConversation((prev) =>
          prev.map((q) =>
            q.id === lastQuery.id ? { ...q, answer: message } : q
          )
        );
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending reply.');
    }
  };

  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No user selected.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      {/* Header */}
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center space-x-3 ">
        {/* Profile Photo */}
        <img
          src={conversation[0]?.user.profilePhoto || "/default-avatar.png"}
          alt={conversation[0]?.user.fullName || "User"}
          className="w-10 h-10 rounded-full object-cover border"
        />

        {/* User Info */}
        <div>
          <h2 className="font-bold">  
            Chat with {conversation[0]?.user.fullName || "User"}
          </h2>
          <p className="text-sm text-gray-500">
            {conversation[0]?.user.email || ""}
          </p>
        </div>
      </div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.map((msg) => (
          <div key={msg.id} className="space-y-1">
            {/* User Question */}
            <div className="flex justify-start">
              <div className="bg-blue-100 text-gray-800 px-4 py-2 rounded-xl max-w-md">
                <p>{msg.question}</p>
                <span className="text-xs text-gray-500 block mt-1">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Admin Answer */}
            {msg.answer && (
              <div className="flex justify-end">
                <div className="bg-green-100 text-gray-800 px-4 py-2 rounded-xl max-w-md">
                  <p>{msg.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t bg-white flex items-center space-x-2 sticky bottom-0"
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={1}
          placeholder="Type your reply..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SupportPage;
