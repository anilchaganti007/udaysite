# 🎉 Birthday Greeting Website

A beautiful animated birthday greeting website built with Next.js and deployed on Vercel.

## Features

- ✨ Animated gradient background
- 🎈 Floating balloons
- 🎊 Confetti animation
- 🎂 Animated birthday cake with candle
- ⭐ Sparkling effects
- 📱 Fully responsive design

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. After deployment, add your custom domain `uday007.in` in Vercel project settings:
   - Go to your project settings
   - Navigate to "Domains"
   - Add `uday007.in` and `www.uday007.in`
   - Update your DNS records in GoDaddy as instructed by Vercel

### DNS Configuration in GoDaddy

After adding the domain in Vercel, you'll need to update DNS records in GoDaddy:

1. Log in to your GoDaddy account
2. Go to DNS Management for `uday007.in`
3. Add/Update the following records:
   - **A Record**: `@` pointing to Vercel's IP (Vercel will provide this)
   - **CNAME Record**: `www` pointing to `cname.vercel-dns.com` (or the value Vercel provides)

Vercel will provide exact DNS values when you add the domain in their dashboard.

## Customization

You can customize the birthday message by editing `app/page.tsx`. The animations and styles can be modified in `app/page.css`.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **CSS Animations** - Smooth animations and effects
- **Vercel** - Hosting and deployment

---

Made with ❤️ for a special birthday celebration!

