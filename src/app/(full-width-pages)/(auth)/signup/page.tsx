import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | FetchTrue Dashboard",
  description: "This is Next.js SignUp Page FetchTrue Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
