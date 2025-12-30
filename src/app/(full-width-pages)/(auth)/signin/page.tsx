import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | FetchTrue Dashboard",
  description: "Signin Page FetchTrue Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
