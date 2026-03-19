# روتين النظافة — Hygiene Routine

تطبيق **Next.js** (React 19) بواجهة عربية RTL: جدول يومي، روتينات مفصّلة، ميزانية شهرية، تذكيرات، ودعم **PWA**.

## التشغيل

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## البناء

```bash
npm run build
npm start
```

## التخزين

- البيانات الافتراضية (أدوات + روتينات) تُحمَّل من `src/data/seed.ts`.
- التعديلات تُحفظ في **localStorage** عبر Zustand (`persist`).

## Firebase (اختياري)

1. أنشئ مشروع Firebase وفعّل **Anonymous Auth** و**Firestore**.
2. انسخ `.env.example` إلى `.env.local` واملأ المتغيرات `NEXT_PUBLIC_FIREBASE_*`.
3. انشر قواعد `firebase/firestore.rules`.

بدون المفاتيح يعمل التطبيق بالكامل محلياً.

## PWA

- `public/manifest.webmanifest`
- `public/sw.js` — تسجيل تلقائي من `RegisterServiceWorker`.

لإشعارات **FCM** الكاملة تحتاج VAPID و`firebase-messaging-sw.js` — يمكن إضافتها لاحقاً؛ حالياً تُستخدم إشعارات المتصفح عند منح الإذن.

## هيكل مهم

| مسار        | الوظيفة        |
|------------|----------------|
| `/`        | لوحة اليوم     |
| `/routines`| قائمة الروتينات |
| `/routines/[id]` | خطوات تفصيلية |
| `/schedule`| أسبوع يبدأ سبت |
| `/budget`  | أسعار + رسم بياني |
| `/products`| كتالوج و CRUD  |
| `/more`    | تثبيت + روابط  |
| `/settings`| تذكيرات + Firebase |
