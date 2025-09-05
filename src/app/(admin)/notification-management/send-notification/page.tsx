"use client"
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useUserContext } from "@/context/UserContext";
import React, { useState } from "react";

const Page = () => {
    const { users = [], error } = useUserContext();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedUser, setSelectedUser] = useState<string>(""); // single user
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // multiple users
    const [mode, setMode] = useState<"single" | "multiple" | "all">("single");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    if (error) return <p className="text-red-500" > {error} </p>;
    if (!users) return;
    const sendNotification = async () => {
        setLoading(true);
        setResponse(null);

        try {
            let url = "";
            let payload: any = { title, body };

            if (mode === "single") {
                const user = users.find((u: any) => u._id === selectedUser);
                payload.tokens = user?.fcmTokens || [];
                url = "/api/notifications/single-user";
            } else if (mode === "multiple") {
                const selected = users.filter((u: any) =>
                    selectedUsers.includes(u._id)
                );
                payload.tokens = selected.flatMap((u: any) => u.fcmTokens || []);
                url = "/api/notifications";
            } else {
                url = "/api/notifications/all-users";
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setResponse(data);
        } catch (error: any) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Send Notification" />
            <div className="space-y-6" >
                <ComponentCard title="Send Notification" >
                    <div className="space-y-4" >
                        {/* Title */}
                        < div >
                            <label className="block text-sm font-medium" > Title </label>
                            < input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter notification title"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-sm font-medium" > Body </label>
                            < textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter notification body"
                            />
                        </div>

                        {/* Dropdown Mode */}
                        <div>
                            <label className="block text-sm font-medium" > Send To </label>
                            < select
                                value={mode}
                                onChange={(e) =>
                                    setMode(e.target.value as "single" | "multiple" | "all")
                                }
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="single" > Single User </option>
                                < option value="multiple" > Multiple Users </option>
                                < option value="all" > All Users </option>
                            </select>
                        </div>

                        {/* Conditional Inputs */}
                        {
                            mode === "single" && (
                                <div>
                                    <label className="block text-sm font-medium" > Select User </label>
                                    < select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)
                                        }
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="" > --Select User-- </option>
                                        {
                                            users?.map((user: any) => (
                                                <option key={user._id} value={user._id} >
                                                    {user.fullName}({user.email})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                        {
                            mode === "multiple" && (
                                <div>
                                    <label className="block text-sm font-medium" > Select Users </label>
                                    < div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3" >
                                        {users?.map((user: any) => (
                                            <div key={user._id} className="flex items-center space-x-2" >
                                                <input
                                                    type="checkbox"
                                                    id={user._id}
                                                    value={user._id}
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (e.target.checked) {
                                                            setSelectedUsers([...selectedUsers, value]);
                                                        } else {
                                                            setSelectedUsers(selectedUsers.filter((id) => id !== value));
                                                        }
                                                    }
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                <label htmlFor={user._id} className="text-sm" >
                                                    {user.fullName}({user.email})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        {/* Button */}
                        <div>
                            <button
                                onClick={sendNotification}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                {loading ? "Sending..." : "Send Notification"}
                            </button>
                        </div>

                        {/* Response */}
                        {
                            response && (
                                <pre className="bg-gray-100 p-2 rounded text-sm" >
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            )
                        }
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
};

export default Page;
