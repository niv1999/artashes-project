# פריסה ל-Cloudflare Pages (חינם)

האפליקציה היא אתר סטטי (`public/`) + פונקציות (`functions/`) + אחסון KV.
אין צורך בדומיין. הכתובת תהיה `https://<שם-הפרויקט>.pages.dev`.

## 1. יצירת הפרויקט (חד-פעמי)
1. ב-https://dash.cloudflare.com ← **Workers & Pages** ← **Create** ← **Pages** ← **Connect to Git**.
2. לבחור את הריפו `niv1999/artashes-project` ואת הענף `claude/elegant-allen-ba1eqt`
   (או ענף `main` אחרי מיזוג).
3. הגדרות בנייה:
   - Framework preset: **None**
   - Build command: *(ריק)*
   - Build output directory: **public**
4. **Save and Deploy**. (הפריסה הראשונה תעבוד אבל האפליקציה עוד לא תשמור כלום – חסרים שלבים 2–3.)

## 2. אחסון (KV)
1. **Workers & Pages** ← **KV** ← **Create a namespace**, שם: `kitchen`.
2. חזרה לפרויקט ← **Settings** ← **Bindings** ← **Add** ← **KV namespace**:
   - Variable name: **KITCHEN** (בדיוק כך, באותיות גדולות)
   - KV namespace: `kitchen`
   - להוסיף ל-**Production** (ואם רוצים גם ל-Preview).

## 3. סיסמת ניהול
בפרויקט ← **Settings** ← **Variables and Secrets** ← **Add**:
- Name: **ADMIN_PASSWORD**
- Type: **Secret**
- Value: סיסמה ארוכה (8+ תווים). רק אתה יודע אותה.

## 4. פריסה מחדש
**Deployments** ← על הפריסה האחרונה **Retry deployment** (כדי שה-KV והסיסמה ייכנסו לתוקף).

## 5. שימוש
- דף ניהול (רק אתה): `https://<project>.pages.dev/admin`
- אפליקציית הטבח: `https://<project>.pages.dev/`
  הטבח פותח אותה פעם אחת עם אינטרנט ושומר למסך הבית:
  - אייפון (Safari): כפתור שיתוף ← **Add to Home Screen**.
  - אנדרואיד (Chrome): תפריט ⋮ ← **Add to Home screen / Install app**.

## הרצה מקומית (לפיתוח)
```
npm install
npm run dev     # http://localhost:8788  סיסמת ניהול מקומית: test1234
```
