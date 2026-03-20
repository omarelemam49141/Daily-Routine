"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { sendPasswordReset, signInWithEmail } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function mapAuthError(e: unknown): string {
  if (e && typeof e === "object" && "code" in e) {
    const code = String((e as { code?: string }).code ?? "");
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-email":
        return "البريد أو كلمة المرور غير صحيحة";
      case "auth/too-many-requests":
        return "محاولات كثيرة، حاول لاحقاً";
      case "auth/user-disabled":
        return "هذا الحساب معطّل";
      default:
        return "تعذر تسجيل الدخول";
    }
  }
  return "تعذر تسجيل الدخول";
}

export default function LoginPage() {
  const router = useRouter();
  const { requireAuth, authResolved, hasFirebase, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authResolved) return;
    if (!requireAuth) {
      router.replace("/");
    }
  }, [requireAuth, authResolved, router]);

  useEffect(() => {
    if (!authResolved) return;
    if (requireAuth && user) {
      router.replace("/");
    }
  }, [requireAuth, authResolved, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("أدخل البريد وكلمة المرور");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      toast.success("تم تسجيل الدخول");
      router.replace("/");
    } catch (err) {
      toast.error(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!email.trim()) {
      toast.message("أدخل البريد أولاً لإرسال رابط الاستعادة");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordReset(email);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
    } catch {
      toast.error("تعذر إرسال رابط الاستعادة");
    } finally {
      setBusy(false);
    }
  };

  if (!requireAuth) {
    return null;
  }

  if (!authResolved) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-teal-900/70 dark:text-white/60">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium">جاري التحميل…</p>
      </div>
    );
  }

  if (!hasFirebase) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="text-center">
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">روتين النظافة</h1>
        <p className="mt-1 text-sm text-teal-900/55 dark:text-white/50">
          سجّل الدخول للمتابعة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تسجيل الدخول</CardTitle>
          <CardDescription>
            البريد وكلمة المرور تُداران في Firebase — لا تُخزَّن في المستودع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "جاري الدخول…" : "دخول"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              disabled={busy}
              onClick={onReset}
            >
              نسيت كلمة المرور؟
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
