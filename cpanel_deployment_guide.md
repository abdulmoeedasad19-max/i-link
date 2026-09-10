# cPanel Deployment Guide

Yeh guide aapke naye decoupled architecture (Frontend aur Backend) ko cPanel par deploy karne ke liye hai.

**Note:** Next.js mein dynamic routes (jaise `/brands/[slug]`) hone ki wajah se isko fully "Static HTML" me convert nahi kiya ja sakta. Lekin achi baat yeh hai ke cPanel aapko Node.js apps host karne deta hai (jese hum backend kar rahe hain), toh hum Frontend aur Backend dono ko as a **Node.js App** host karenge!

---

## 1. Backend Deploy Karna (Express Node.js App)

Aapki API `aapkidomain.com/api` par chalegi.

### Steps:
1. **cPanel** login karein aur **File Manager** mein jayein.
2. Root directory (home directory, `public_html` ke bahar) mein ek naya folder banayein, e.g., `api-backend`.
3. Apne local `backend/` folder ki saari files (siwaye `node_modules` ke) zip karein aur is naye `api-backend` folder mein upload karke extract karein.
4. Ab cPanel ke main dashboard par jayein aur **"Setup Node.js App"** par click karein.
5. **"Create Application"** par click karein aur yeh details daalein:
   - **Node.js version:** 20.x (ya latest available)
   - **Application mode:** Production
   - **Application root:** `api-backend` (jo folder aapne banaya)
   - **Application URL:** `api` (URL path)
   - **Application startup file:** `cpanel.js` (Main ne yeh file special cPanel ke liye banayi hai)
6. Niche scroll karein aur **Environment Variables** section mein apni `.env` file ka data Add karein:
   - `DATABASE_URL` = Aapka Neon DB URL
   - `AUTH_SECRET` = Aapka secret
   - `PORT` = `5000`
   - `FRONTEND_URL` = `https://aapkidomain.com`
7. Settings save karein aur **"Run NPM Install"** button par click karein.
8. Install hone ke baad **"Start App"** par click karein.

---

## 2. Frontend Deploy Karna (Next.js Standalone App)

Aapki website ka frontend main domain `aapkidomain.com` par chalega.

### Steps:
1. Apne local computer par terminal mein `frontend/` folder mein jayein aur `npm run build` chalayein.
2. Build hone ke baad, aapke `frontend/.next/standalone/` folder me ek production-ready Node.js app generate hogi.
3. cPanel ke **File Manager** mein jayein.
4. Root directory mein ek naya folder banayein, e.g., `frontend-app`.
5. Apne local computer par `frontend/.next/standalone/` ke andar ka saara data select karein aur ek **.zip** banayein. *(Sath hi apna `public/` aur `.next/static/` folder bhi zip me include karein, takay images aur styles sahi chalein, jaise Next.js standalone docs me likha hota hai).*
6. Is `.zip` ko cPanel me `frontend-app` folder me upload karke extract karein.
7. Ab cPanel ke **"Setup Node.js App"** mein wapas jayein aur ek naya app banayein:
   - **Node.js version:** 20.x
   - **Application mode:** Production
   - **Application root:** `frontend-app`
   - **Application URL:** Khali chhor dein (taakay yeh main domain par chale)
   - **Application startup file:** `server.js` (Yeh file standalone folder ke andar automatically generate hoti hai)
8. **Environment Variables** mein frontend ke envs daalein:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://aapkidomain.com/api`
9. **Start App** par click karein!

*(Koi `npm install` karne ki zaroorat nahi hai frontend ke liye kyun ke standalone folder me Next.js khud zaroori files daal deta hai).*

---

### `.htaccess` Configuration (Main Domain ke liye)
Kyun ke ab aapka main domain Node.js (Next.js) ke through handle ho raha hai, cPanel Node.js App khud `public_html` ke `.htaccess` ko modify kar deta hai Passenger ke rules daal kar. Aapko manually `.htaccess` me kuch dalne ki zaroorat nahi hai, cPanel sab automatically manage kar lega!
