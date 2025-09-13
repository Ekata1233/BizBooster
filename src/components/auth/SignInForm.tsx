// "use client";
// import Checkbox from "@/components/form/input/Checkbox";
// import Input from "@/components/form/input/InputField";
// import Label from "@/components/form/Label";
// import Button from "@/components/ui/button/Button";
// import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
// import Link from "next/link";
// import React, { useState } from "react";

// export default function SignInForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   return (
//     <div className="flex flex-col flex-1 lg:w-1/2 w-full bg-brand-950 ">
//       <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
//         <Link
//           href="/"
//           className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//         >
//           <ChevronLeftIcon />
//           Back to dashboard
//         </Link>
//       </div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-white text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign In
//             </h1>
//             <p className="text-sm text-gray-300 dark:text-gray-400">
//               Enter your email and password to sign in!
//             </p>
//           </div>
//           <div>
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">

//             </div>

//             <form>
//               <div className="space-y-6">
//                 <div>
//                   <Label>
//                     Email <span className="text-error-500">*</span>{" "}
//                   </Label>
//                   <Input placeholder="info@gmail.com" type="email" />
//                 </div>
//                 <div>
//                   <Label>
//                     Password <span className="text-error-500">*</span>{" "}
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Enter your password"
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                     >
//                       {showPassword ? (
//                         <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
//                       ) : (
//                         <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
//                       )}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <Checkbox checked={isChecked} onChange={setIsChecked} />
//                     <span className="block font-normal text-gray-300 text-theme-sm dark:text-gray-400">
//                       Keep me logged in
//                     </span>
//                   </div>
//                   <Link
//                     href="/reset-password"
//                     className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <div>
//                   <Button className="w-full" size="sm">
//                     Sign in
//                   </Button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-300 dark:text-gray-400 sm:text-start">
//                 Don&apos;t have an account? {""}
//                 <Link
//                   href="/signup"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                 >
//                   Sign Up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
      // ✅ Set cookie
      document.cookie = `isLoggedIn=true; path=/; max-age=${isChecked ? 60 * 60 * 24 * 7 : 60 * 60 // 7 days if "keep me logged in", else 1 hour
        }`;

      // alert("Login successful!");
      // router.push("/");

      window.alert("Login successful!");

      // Add a small delay to ensure cookie is set
      setTimeout(() => {
        router.push("/");
      }, 100);
    } else {
      alert("Invalid email or password!");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full bg-brand-950 ">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-white text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <Label>
                  Username <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="admin123"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-white"
                />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
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
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-300 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div>
                <Button className="w-full" size="sm" type="submit">
                  Sign in
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-300 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

