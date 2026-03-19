"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ensureAnonymousUser, getFirebase } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationSettings,
  useRequestBrowserNotificationPermission,
} from "@/hooks/use-notification-settings";
import { useHygieneStore } from "@/stores/hygiene-store";

const HYGIENE_STORAGE_KEY = "hygiene-routine-v2";
const NOTIFY_STORAGE_KEY = "hygiene-notify-settings";

type LocalBackupPayload = {
  version: 1;
  exportedAt: string;
  data: {
    hygieneStore: string | null;
    notifySettings: string | null;
  };
};

export default function SettingsPage() {
  const resetToSeed = useHygieneStore((s) => s.resetToSeed);
  const {
    enabled,
    pushEnabled,
    morningTime,
    eveningTime,
    setEnabled,
    setPushEnabled,
    setMorningTime,
    setEveningTime,
  } = useNotificationSettings();
  const requestPerm = useRequestBrowserNotificationPermission();

  const [fbOk, setFbOk] = useState<boolean | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getFirebase().then((f) => setFbOk(Boolean(f)));
  }, []);

  const exportLocalData = () => {
    try {
      const payload: LocalBackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          hygieneStore: localStorage.getItem(HYGIENE_STORAGE_KEY),
          notifySettings: localStorage.getItem(NOTIFY_STORAGE_KEY),
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hygiene-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل نسخة احتياطية من البيانات المحلية");
    } catch {
      toast.error("تعذر تصدير البيانات");
    }
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<LocalBackupPayload>;
      if (parsed.version !== 1 || !parsed.data) {
        toast.error("ملف النسخة الاحتياطية غير صالح");
        return;
      }

      if (typeof parsed.data.hygieneStore === "string") {
        localStorage.setItem(HYGIENE_STORAGE_KEY, parsed.data.hygieneStore);
      }
      if (typeof parsed.data.notifySettings === "string") {
        localStorage.setItem(NOTIFY_STORAGE_KEY, parsed.data.notifySettings);
      }

      toast.success("تم استيراد البيانات، سيتم إعادة تحميل الصفحة");
      window.location.reload();
    } catch {
      toast.error("تعذر قراءة ملف النسخة الاحتياطية");
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">الإعدادات</h1>
        <p className="text-sm text-teal-900/55 dark:text-white/50">
          تذكيرات، سحابة اختيارية، وإعادة ضبط البيانات
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">التذكيرات</CardTitle>
          <CardDescription>داخل التطبيق + إشعار المتصفح (إن وُجد)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="en">تفعيل التذكيرات</Label>
            <Switch id="en" checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>صباحاً</Label>
              <Input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>مساءً</Label>
              <Input
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="push">إشعارات المتصفح</Label>
              <p className="text-xs text-teal-800/55 dark:text-white/45">
                يحتاج إذناً من المتصفح
              </p>
            </div>
            <Switch id="push" checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={async () => {
              const r = await requestPerm();
              if (r === "granted") {
                setPushEnabled(true);
                toast.success("تم تفعيل إذن الإشعارات");
              } else if (r === "denied") {
                toast.error("تم رفض الإذن");
              } else {
                toast.message("المتصفح لا يدعم الإشعارات");
              }
            }}
          >
            طلب إذن الإشعارات
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Firebase (اختياري)</CardTitle>
          <CardDescription>
            عند إضافة مفاتيح البيئة يمكن تفعيل الدخول المجهول لاحقاً للمزامنة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-teal-900/65 dark:text-white/60">
            الحالة:{" "}
            <span className="font-bold">
              {fbOk === null
                ? "…"
                : fbOk
                  ? "مُعدّ (يمكن تسجيل الدخول)"
                  : "غير مُعد — التخزين محلي فقط"}
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={!fbOk}
            onClick={async () => {
              const uid = await ensureAnonymousUser();
              if (uid) toast.success("تم تسجيل الدخول المجهول");
              else toast.error("تعذر الاتصال بـ Firebase");
            }}
          >
            تسجيل دخول مجهول
          </Button>
        </CardContent>
      </Card>

      <Card className="border-rose-300/40">
        <CardHeader>
          <CardTitle className="text-base text-rose-800 dark:text-rose-200">منطقة خطرة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-rose-300/60 text-rose-700"
            onClick={() => {
              if (confirm("إعادة ضبط كل البيانات للقيم الافتراضية؟")) {
                resetToSeed();
                toast.success("تمت إعادة الضبط");
              }
            }}
          >
            إعادة ضبط البيانات الافتراضية
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/products">إدارة المنتجات</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">نسخة احتياطية محلية</CardTitle>
          <CardDescription>
            لنقل بيانات المتصفح من جهاز أو رابط إلى آخر (مثل localhost إلى GitHub Pages)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
          <Button type="button" variant="outline" className="w-full" onClick={exportLocalData}>
            تصدير البيانات المحلية (JSON)
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => importInputRef.current?.click()}
          >
            استيراد نسخة محلية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
