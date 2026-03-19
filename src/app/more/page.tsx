"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MorePage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">المزيد</h1>
        <p className="text-sm text-teal-900/55 dark:text-white/50">اختصارات وتركيب التطبيق</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-teal-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-5 w-5" />
              تثبيت التطبيق (PWA)
            </CardTitle>
            <CardDescription>
              سجّل Service Worker مفعّل — جرّب «إضافة للشاشة الرئيسية» من قائمة المتصفح
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deferred ? (
              <Button
                type="button"
                className="w-full"
                onClick={async () => {
                  await deferred.prompt();
                  setDeferred(null);
                }}
              >
                تثبيت الآن
              </Button>
            ) : (
              <p className="text-sm text-teal-900/60 dark:text-white/55">
                إن لم يظهر زر التثبيت، استخدم خيار المتصفح لإضافة الاختصار للهاتف.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-3">
        <Link href="/products">
          <Card className="transition-transform hover:scale-[1.01]">
            <CardContent className="flex items-center gap-3 p-4">
              <Package className="h-8 w-8 text-teal-600" />
              <div>
                <p className="font-bold text-teal-950 dark:text-white">المنتجات</p>
                <p className="text-xs text-teal-800/55 dark:text-white/45">كتالوج وإدارة</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings">
          <Card className="transition-transform hover:scale-[1.01]">
            <CardContent className="flex items-center gap-3 p-4">
              <Settings className="h-8 w-8 text-cyan-600" />
              <div>
                <p className="font-bold text-teal-950 dark:text-white">الإعدادات</p>
                <p className="text-xs text-teal-800/55 dark:text-white/45">تذكيرات وFirebase</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
