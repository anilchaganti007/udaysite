# Vercel Deployment Guide

This guide explains how to deploy your Eggbator application to Vercel and configure environment variables.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free account works)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Firebase Project**: Already set up (from previous steps)

## Step 1: Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Vercel will auto-detect Next.js settings

## Step 2: Configure Environment Variables

### Method 1: Via Vercel Dashboard (Recommended)

1. In your project settings, go to **"Settings"** → **"Environment Variables"**
2. Add each environment variable one by one:

#### Required Environment Variables:

```env
FIREBASE_SERVICE_ACCOUNT_KEY
```
**Value**: Paste your entire Firebase service account JSON as a single-line string (same format as `.env` file)

**Important**: 
- Paste the entire JSON object
- Keep it on a single line
- Escape quotes properly: `"` → `\"`
- Convert `\n` in private_key to actual newlines (Vercel handles this automatically)

#### NextAuth Configuration:

```env
NEXTAUTH_URL
```
**Value**: Your production URL (e.g., `https://your-app.vercel.app`)

```env
NEXTAUTH_SECRET
```
**Value**: Generate a strong random secret (minimum 32 characters)
- Use: `openssl rand -base64 32` (Mac/Linux)
- Or: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))` (PowerShell)

#### Email Configuration:

```env
SMTP_HOST
```
**Value**: `smtp.gmail.com` (or your email provider)

```env
SMTP_PORT
```
**Value**: `587`

```env
SMTP_USER
```
**Value**: Your email address (e.g., `your-email@gmail.com`)

```env
SMTP_PASSWORD
```
**Value**: Your email app password (for Gmail, use App Password)

```env
SMTP_FROM
```
**Value**: `noreply@eggbator.com` (or your preferred sender email)

#### Application Settings:

```env
APP_NAME
```
**Value**: `Eggbator`

```env
APP_URL
```
**Value**: Your production URL (e.g., `https://your-app.vercel.app`)

### Method 2: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Set environment variables:
   ```bash
   vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   # ... repeat for each variable
   ```

## Step 3: Deploy

### Automatic Deployment

Once connected, Vercel automatically deploys:
- Every push to `main` branch → Production
- Every push to other branches → Preview deployment

### Manual Deployment

1. Go to Vercel Dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on latest deployment (after setting env vars)

## Step 4: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test the application:
   - Homepage loads
   - Can register/login
   - Admin panel works
   - Emails send correctly

## Important Notes

### Firebase Service Account Key Format

When adding `FIREBASE_SERVICE_ACCOUNT_KEY` to Vercel:

**Option 1: Single-line JSON (Recommended)**
```
{"type":"service_account","project_id":"your-project",...}
```

**Option 2: Multi-line JSON**
Vercel supports multi-line values. Paste the JSON as-is, and Vercel will handle it correctly.

### Environment Variable Scopes

In Vercel, you can set variables for:
- **Production**: Only production deployments
- **Preview**: Only preview deployments  
- **Development**: Only local development

**Recommendation**: Set all variables for all environments (Production, Preview, Development)

### Updating Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Edit the variable
3. Click **"Save"**
4. **Redeploy** your application for changes to take effect

## Troubleshooting

### Build Fails

**Error**: "FIREBASE_SERVICE_ACCOUNT_KEY not found"
- **Solution**: Make sure you added the environment variable in Vercel dashboard
- **Solution**: Verify the JSON is valid (use a JSON validator)

**Error**: "Module not found"
- **Solution**: Check `package.json` dependencies are correct
- **Solution**: Run `npm install` locally to verify

### Runtime Errors

**Error**: "Firebase Admin not initialized"
- **Solution**: Check `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- **Solution**: Verify JSON format is correct (no extra spaces, proper escaping)

**Error**: "NEXTAUTH_SECRET is missing"
- **Solution**: Add `NEXTAUTH_SECRET` environment variable
- **Solution**: Make sure it's at least 32 characters

**Error**: "Email not sending"
- **Solution**: Verify SMTP credentials are correct
- **Solution**: Check `SMTP_FROM` matches your email domain (for some providers)
- **Solution**: For Gmail, ensure you're using App Password, not regular password

### Checking Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify all variables are listed
3. Check they're enabled for the correct environments (Production/Preview/Development)

## Quick Checklist

- [ ] Repository connected to Vercel
- [ ] All environment variables added
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` set correctly
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `NEXTAUTH_SECRET` generated and added
- [ ] SMTP credentials configured
- [ ] `APP_NAME` set to "Eggbator"
- [ ] `APP_URL` set to production URL
- [ ] Application deployed successfully
- [ ] Tested registration/login
- [ ] Tested email sending
- [ ] Admin panel accessible

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Need Help?** Check Vercel deployment logs in the dashboard for specific error messages.

