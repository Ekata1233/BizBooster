import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | FetchTrue Dashboard",
  description: "This is Next.js Signin Page FetchTrue Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
