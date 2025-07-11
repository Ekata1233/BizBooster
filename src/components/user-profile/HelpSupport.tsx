'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { EyeIcon } from 'lucide-react';

interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  question: string;
  answer?: string;
  createdAt: string;
}

interface SupportEntryFromAPI {
  _id: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
  question: string;
  answer?: string;
  createdAt: string;
}


const SupportPage = () => {
  // const [queries, setQueries] = useState<UserQuery[]>([
  //   {
  //     id: '1',
  //     userId: '681c72b9062be714d7037840',
  //     userName: 'EmmaJohnson',
  //     userEmail: 'john@example.com',
  //     question: 'How can I update my profile?',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '2',
  //     userId: '681c72d2062be714d7037844',
  //     userName: 'Jane Smith',
  //     userEmail: 'jane@example.com',
  //     question: 'I forgot my password. What should I do?',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '3',
  //     userId: '681c72d9062be714d7037848',
  //     userName: 'Mike Johnson',
  //     userEmail: 'mike@example.com',
  //     question: 'Can I delete my account?',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '4',
  //     userId: 'u004',
  //     userName: 'Emily Brown',
  //     userEmail: 'emily@example.com',
  //     question: 'Why is my account locked?',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '5',
  //     userId: 'u005',
  //     userName: 'Chris Lee',
  //     userEmail: 'chris@example.com',
  //     question: 'Can I change my subscription plan?',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '6',
  //     userId: 'u006',
  //     userName: 'Sara White',
  //     userEmail: 'sara@example.com',
  //     question: 'I didn’t receive my confirmation email.',
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     id: '7',
  //     userId: '6825ac4596afe10e5ffb1714',
  //     userName: 'Chandu Classy',
  //     userEmail: 'princechandu357@gmail.com',
  //     question: 'I didn’t receive my confirmation email.',
  //     createdAt: new Date().toISOString(),
  //   },
  // ]);

  const [queries, setQueries] = useState<UserQuery[]>([]);

  const [answered, setAnswered] = useState<UserQuery[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(queries[0]?.id || null);
  const [answer, setAnswer] = useState('');
  const [showAll, setShowAll] = useState(false);

  const selectedQuery = queries.find((q) => q.id === selectedId);
  const visibleQueries = showAll ? queries : queries.slice(0, 4);




  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await axios.get('/api/support/question');
        const rawData: SupportEntryFromAPI[] = res.data.data;

        const formatted: UserQuery[] = rawData
          .filter((entry) => entry.user) // skip entries without user
          .map((entry) => ({
            id: entry._id,
            userId: entry.user!._id,
            userName: entry.user!.fullName,
            userEmail: entry.user!.email,
            question: entry.question,
            answer: entry.answer,
            createdAt: entry.createdAt,
          }));

        setQueries(formatted.filter((q) => !q.answer));
        setAnswered(formatted.filter((q) => !!q.answer));
        setSelectedId(formatted.find((q) => !q.answer)?.id || null);
      } catch (error) {
        console.error('Error fetching support queries:', error);
      }
    };

    fetchQueries();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !answer.trim()) return;

    const query = queries.find((q) => q.id === selectedId);
    if (!query) return;


    try {
      const res = await axios.post('/api/support/answer', {
      
        // userId: query.userId,
         supportId: query.id, // this is _id from HelpAndSuppor
        question: query.question,
        answer,
      });

      if (!res.data.success) {
        alert('Failed to send email: ' + res.data.message);
        return;
      }

      const updatedAnswered = [...answered, { ...query, answer }];
      const updatedQueries = queries.filter((q) => q.id !== selectedId);

      setQueries(updatedQueries);
      setAnswered(updatedAnswered);
      setSelectedId(updatedQueries[0]?.id || null);
      setAnswer('');
      alert('Reply sent successfully and email delivered!');
    } catch (error) {
      console.error(error);
      alert('Error sending email.');
    }

  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="grid sm:grid-cols-3 gap-4 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Sidebar */}
        <div className="border-r p-4 h-full">
          <h2 className="text-xl font-bold mb-4">User Queries</h2>
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {visibleQueries.map((query) => (
              <li
                key={query.id}
                onClick={() => {
                  setSelectedId(query.id);
                  setAnswer(query.answer || '');
                }}
                className={`p-4 rounded-xl cursor-pointer transition border ${selectedId === query.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-blue-50'
                  }`}
              >
                <p className="font-semibold text-gray-800">{query.userName}</p>
                <p className="text-sm text-gray-600 truncate">{query.question}</p>
                <span className="text-xs text-gray-400 block mt-1">
                  {new Date(query.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          {/* View More / Back Link */}
          {queries.length > 5 && (
            <div className="mt-4 text-center">
              <span
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 cursor-pointer underline hover:text-blue-800 text-sm"
              >
                {showAll ? 'Back' : 'View More'}
              </span>
            </div>
          )}
        </div>

        {/* Reply Section */}
        <div className="sm:col-span-2 p-6">
          {selectedQuery ? (
            <>
              <h2 className="text-xl font-bold mb-4">Query Details</h2>
              <div className="bg-gray-50 p-4 rounded-xl border shadow-sm mb-6">
                <p><strong>Name:</strong> {selectedQuery.userName}</p>
                <p><strong>Email:</strong> {selectedQuery.userEmail}</p>
                <p className="mt-2"><strong>Question:</strong></p>
                <div className="bg-white p-3 rounded border mt-1 text-gray-700">{selectedQuery.question}</div>
              </div>

              <form onSubmit={handleReply} className="space-y-4">
                <label className="block font-medium text-gray-700">Your Answer:</label>
                <textarea
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Type your reply to the user here..."
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
                >
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a query to view details
            </div>
          )}
        </div>
      </div>

      {/* Answered Queries Table */}
      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Answered Queries</h2>
        {answered.length === 0 ? (
          <p className="text-gray-400">No queries answered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left border">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Question</th>
                  <th className="p-3 border">Answer</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">View</th>

                </tr>
              </thead>
              <tbody>
                {answered.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="p-3 border">{q.userName}</td>
                    <td className="p-3 border">{q.userEmail}</td>
                    <td className="p-3 border text-gray-700">{q.question}</td>
                    <td className="p-3 border text-blue-800">{q.answer}</td>
                    <td className="p-3 border text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex justify-center items-center">

                        <Link href={`/customer-management/user/user-list/helpsupportchat/${q.userId}`} passHref>
                          <button className="text-blue-500 flex border p-2 rounded-md">
                            <EyeIcon />
                          </button>
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
