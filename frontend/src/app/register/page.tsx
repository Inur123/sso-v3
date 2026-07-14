"use client"

import { RegisterForm } from "@/components/register-form"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight">
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
                <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  <span>Memuat form pendaftaran...</span>
                </div>
              }
            >
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-slate-100 lg:block">
        <img
          src="/sso_login_bg.png"
          alt="SSO Secure Gateway Illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
