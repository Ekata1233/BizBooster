"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Static credentials
    const validEmail = "Admin@FetchTrue";
    const validPassword = "FetchTrue@2025";

    setIsLoading(true);

    if (email === validEmail && password === validPassword) {
      // ✅ Set cookie for deployment (Secure + SameSite)
      document.cookie = `isLoggedIn=true; path=/; max-age=${
        isChecked ? 60 * 60 * 24 * 7 : 60 * 60 * 24
      }; SameSite=Lax; Secure`;

      toast.success("Login successful! Redirecting...");

      // Redirect after small delay to show toast
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      toast.error("Invalid email or password!");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <Toaster position="top-right" />
      <div className="bg-blue-600 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Sign In
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label className="text-white">Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-white"
            />
          </div>
          <div>
            <Label className="text-white">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-white"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 cursor-pointer right-4 top-1/2 z-10"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-200" />
                ) : (
                  <EyeCloseIcon className="fill-gray-200" />
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-white text-sm">Keep me logged in</span>
            </div>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
