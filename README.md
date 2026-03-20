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
2. أضف أسرار **Actions** (نفس أسماء المتغيرات): `NEXT_PUBLIC_FIREBASE_*` كما في [.env.example](.env.example).  
   كلمة المرور **لا تُوضع في الكود** — تُنشأ مستخدم Email/Password من [Firebase Console](https://console.firebase.google.com) → Authentication → Users.
3. في Firebase: **Authentication → Sign-in method** فعّل **Email/Password**، ثم **Authentication → Users → Add user** (بريدك + كلمة المرور).  
   وأضف في **Authentication → Settings → Authorized domains** النطاق: `omarelemam49141.github.io`.
4. ادفع إلى الفرع `main` — سيعمل سير العمل [deploy-github-pages.yml](.github/workflows/deploy-github-pages.yml) (`NEXT_PUBLIC_REQUIRE_AUTH=true` + بناء ثابت).
5. الرابط: `https://omarelemam49141.github.io/Daily-Routine/` — تظهر شاشة تسجيل الدخول قبل التطبيق.

> **ملاحظة:** صفحات تفاصيل الروتين `/routines/[id]` تُبنى مسبقاً لروتينات الـ seed فقط. روابط معرفات جديدة (مضافة يدوياً) قد لا تعمل عند فتحها مباشرة على الاستضافة الثابتة.

### إذا ظهرت «تعذر تفعيل الدخول»

يعني أن **بناء GitHub Actions** لم يجد مفاتيح Firebase (لم تُضف أسرار المستودع أو البناء تم قبل إضافتها).

1. افتح [Firebase Console](https://console.firebase.google.com) → مشروعك → **Project settings** (ترس) → **Your apps** → تطبيق الويب → انسخ قيم `firebaseConfig`.
2. على GitHub: المستودع **Daily-Routine** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. أضف سراً لكل اسم **بالضبط** (الاسم حساس لحالة الأحرف):

   | اسم السر في GitHub |
   |-------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (اختياري؛ إن لم يوجد اتركه فارغاً أو أنشئ سراً بقيمة فارغة إن سمح GitHub) |

4. من تبويب **Actions** شغّل سير العمل **Deploy to GitHub Pages** يدوياً (**Run workflow**) أو ادفع أي commit إلى `main` لإعادة البناء.
5. انتظر اكتمال النشر ثم حدّث الصفحة (يفضّل تحديثاً قوياً Ctrl+F5).

إذا بقي التطبيق على «جاري التحميل…» بعد النشر: في DevTools → **Application** → **Service workers** فعّل **Unregister** (أو **Update on reload**) ثم أعد تحميل الصفحة — النسخة القديمة من `sw.js` قد تكون خزّنت صفحة خاطئة لمسار `/login`.

## التخزين

- البيانات الافتراضية (أدوات + روتينات) تُحمَّل من `src/data/seed.ts`.
- التعديلات تُحفظ في **localStorage** عبر Zustand (`persist`).

## Firebase

- **الإنتاج (GitHub Pages):** الدخول بـ **البريد + كلمة المرور** عبر Firebase؛ المفاتيح العامة `NEXT_PUBLIC_*` تُمرَّر من أسرار GitHub عند البناء، و**كلمة المرور تبقى في Firebase فقط** (لا تُرفع للمستودع).
- **التطوير المحلي بدون حماية:** اترك `NEXT_PUBLIC_REQUIRE_AUTH=false` (افتراضي في [.env.example](.env.example)) — التطبيق يعمل بدون تسجيل دخول.
- **تسجيل دخول مجهول (اختياري):** عندما `NEXT_PUBLIC_REQUIRE_AUTH=false` ووُجدت مفاتيح Firebase، يمكن استخدام «تسجيل دخول مجهول» من الإعدادات للاستعداد للمزامنة لاحقاً.
- **Firestore:** إن أردت مزامنة سحابية لاحقاً، انشر قواعد `firebase/firestore.rules`.

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
| `/login`   | تسجيل الدخول (عند تفعيل `NEXT_PUBLIC_REQUIRE_AUTH`) |
| `/settings`| تذكيرات + الحساب / Firebase |
