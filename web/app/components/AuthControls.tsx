"use client";

import type { CSSProperties, ReactNode } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_CLIENT_ENABLED,
  CLERK_SIGN_IN_URL,
} from "../lib/clerk";

type SignInTextButtonProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function SignInTextButton(props: SignInTextButtonProps) {
  if (!CLERK_CLIENT_ENABLED) {
    return (
      <Link href={CLERK_SIGN_IN_URL} className={props.className} style={props.style}>
        {props.children}
      </Link>
    );
  }

  return <ClerkSignInTextButton {...props} />;
}

function ClerkSignInTextButton({
  children,
  className,
  style,
}: SignInTextButtonProps) {
  const { isLoaded, isSignedIn } = useUser();
  const linkClassName = ["border-0 bg-transparent p-0 cursor-pointer", className]
    .filter(Boolean)
    .join(" ");

  if (!isLoaded) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  if (isSignedIn) {
    return (
      <span className="inline-flex items-center align-middle">
        <UserButton />
      </span>
    );
  }

  return (
    <SignInButton
      mode="redirect"
      fallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
    >
      <button type="button" className={linkClassName} style={style}>
        {children}
      </button>
    </SignInButton>
  );
}
