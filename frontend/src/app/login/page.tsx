"use client";

import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sso_logo.png"
              alt="Logo Portal SSO"
              className="size-8 object-contain rounded-lg shadow-sm"
            />
            Portal SSO Perusahaan
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <span>Loading form...</span>
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-slate-100 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sso_login_bg.png"
          alt="SSO Secure Gateway Illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
