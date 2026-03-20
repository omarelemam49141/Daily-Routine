"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { requireAuth, authenticated, login } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!requireAuth || authenticated) {
      router.replace("/");
    }
  }, [requireAuth, authenticated, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("أدخل كلمة المرور");
      return;
    }
    setBusy(true);
    const ok = await login(password);
    setBusy(false);
    if (ok) {
      toast.success("تم تسجيل الدخول");
      router.replace("/");
    } else {
      toast.error("كلمة المرور غير صحيحة");
    }
  };

  if (!requireAuth) {
    return null;
  }

  if (authenticated) {
    return null;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="text-center">
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">
          روتين النظافة
        </h1>
        <p className="mt-1 text-sm text-teal-900/55 dark:text-white/50">
          سجّل الدخول للمتابعة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل كلمة المرور الخاصة بك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "جاري التحقق…" : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
