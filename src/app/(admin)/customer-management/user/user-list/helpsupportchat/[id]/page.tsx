'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
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
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    useEffect(() => {
        if (!userId) {
            setIsLoading(false); // If no userId, stop loading and show no chats
            return;
        }
        console.log("userId new :", userId);

        const fetchChats = async () => {
            setIsLoading(true); // Start loading
            setError(null); // Clear any previous errors
            try {
                const res = await axios.get(`/api/support/answer/${userId}`);
                console.log('data :', res.data.data);
                setChats(res.data.data);
            } catch (err: unknown) { // Catch unknown error type
                console.error('Failed to fetch chats:', err);
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || 'Failed to fetch chats.');
                } else if (err instanceof Error) {
                    setError(err.message || 'An unexpected error occurred.');
                } else {
                    setError('An unknown error occurred.');
                }
                setChats([]); // Ensure chats is empty on error
            } finally {
                setIsLoading(false); // Stop loading regardless of success or failure
            }
        };

        fetchChats();
    }, [userId]);

    // --- Conditional Rendering based on state ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-700">Loading chats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-600">Error: {error}</p>
            </div>
        );
    }

    if (!chats.length) {
        return <p className="p-4 text-center text-gray-600">No chats available for this user.</p>;
    }

    // If we reach here, data is loaded, no error, and there are chats
    const user = chats[0]?.user; // Assuming user info is consistent across entries for the same userId

    return (
        <div className="max-w-8xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-6">
            <h1 className="text-2xl font-bold">Support Chat</h1>

            <div className="bg-gray-50 p-4 rounded-md border">
                <p><strong>User Name:</strong> {user?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>

            <div className="space-y-6">
                {chats.map((entry) => (
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
             <Link href="/customer-management/user/user-list/681c72b9062be714d7037840" className="inline-block">
                    <Button className="mt-4">Back</Button>
                  </Link>
        </div>
    );
};

export default HelpSupportChatPage;