import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | BizBooster Dashboard",
  description: "This is Next.js Signin Page BizBooster Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
