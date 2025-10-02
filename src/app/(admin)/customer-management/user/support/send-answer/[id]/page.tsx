'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';

interface UserQuery {
  _id: string;
  question: string;
  answer?: string;
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string; // optional
  };
}

interface SendAnswerResponse {
  success: boolean;
  message?: string;
}

const SupportPage = () => {
  const params = useParams();
  const questionId = params?.id; // Get question ID from URL
  const [conversation, setConversation] = useState<UserQuery[]>([]);
  const [message, setMessage] = useState('');

  // Fetch only this specific question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) return;

      try {
        const res = await axios.get<{ data: UserQuery }>(
          `/api/support/question/by-id/${questionId}`
        );

        // Only display if question is unanswered
        if (res.data.data && !res.data.data.answer) {
          setConversation([res.data.data]);
        } else {
          setConversation([]); // already answered, show nothing
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Send reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || conversation.length === 0) return;

    const question = conversation[0];

    try {
      const res = await axios.post<SendAnswerResponse>('/api/support/answer', {
        supportId: question._id,
        question: question.question,
        answer: message,
      });

      if (res.data.success) {
        // Update local state with the new answer
        setConversation([{ ...question, answer: message }]);
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending reply.');
    }
  };

  if (!questionId) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No question selected.
      </div>
    );
  }

  if (conversation.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No unanswered question found.
      </div>
    );
  }

  const question = conversation[0];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center space-x-3">
        {/* Profile Photo */}
        <img
          src={question.user.profilePhoto || '/default-avatar.png'}
          alt={question.user.fullName || 'User'}
          className="w-10 h-10 rounded-full object-cover border"
        />

        {/* User Info */}
        <div>
          <h2 className="font-bold">Chat with {question.user.fullName}</h2>
          <p className="text-sm text-gray-500">{question.user.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {/* User Question */}
        <div className="flex justify-start">
          <div className="bg-blue-100 text-gray-800 px-4 py-2 rounded-xl max-w-md">
            <p>{question.question}</p>
            <span className="text-xs text-gray-500 block mt-1">
              {new Date(question.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Admin Answer (if exists) */}
        {question.answer && (
          <div className="flex justify-end">
            <div className="bg-green-100 text-gray-800 px-4 py-2 rounded-xl max-w-md">
              <p>{question.answer}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t bg-white flex items-center space-x-2"
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