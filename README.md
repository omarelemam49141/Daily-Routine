# روتين النظافة — Hygiene Routine

تطبيق **Next.js** (React 19) بواجهة عربية RTL: جدول يومي، روتينات مفصّلة، ميزانية شهرية، تذكيرات، ودعم **PWA**.

## التشغيل

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## البناء

التصدير ثابت (`output: "export"`)؛ الناتج في مجلد `out/`.

```bash
npm run build
```

لمعاينة الملفات الثابتة محلياً (مثلاً بعد البناء):

```bash
npx --yes serve out
```

## GitHub Pages

1. في المستودع على GitHub: **Settings → Pages → Build and deployment → Source** اختر **GitHub Actions**.
2. ادفع إلى الفرع `main` — سيعمل سير العمل [deploy-github-pages.yml](.github/workflows/deploy-github-pages.yml) تلقائياً (`npm ci` ثم `npm run build` مع `basePath` = اسم المستودع، مثل `/Daily-Routine`).
3. الرابط يكون عادة: `https://omarelemam49141.github.io/Daily-Routine/`

> **ملاحظة:** صفحات تفاصيل الروتين `/routines/[id]` تُبنى مسبقاً لروتينات الـ seed فقط. روابط معرفات جديدة (مضافة يدوياً) قد لا تعمل عند فتحها مباشرة على الاستضافة الثابتة.

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
