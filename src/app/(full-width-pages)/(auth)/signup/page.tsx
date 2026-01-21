import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | FetchTrue Dashboard",
  description: "SignUp Page FetchTrue Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
