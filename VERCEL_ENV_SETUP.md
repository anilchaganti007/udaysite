# Quick Guide: Adding Environment Variables to Vercel

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sign in to your Vercel account
3. Select your project: **udaysite** (or your project name)

### Step 2: Navigate to Environment Variables

1. Click on your project
2. Go to **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** in the left sidebar

### Step 3: Add Each Environment Variable

Click **"Add New"** button and add the following variables one by one:

---

## Required Environment Variables

### 1. Firebase Service Account Key

**Variable Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`

**Value:** Paste your entire Firebase service account JSON as a **single-line string**

**Example format:**
```
{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Important:**
- Paste the entire JSON object
- Keep it on a single line
- Vercel will handle `\n` characters automatically
- Make sure all quotes are properly escaped

**Environment:** Select all (Production, Preview, Development)

---

### 2. NextAuth URL

**Variable Name:** `NEXTAUTH_URL`

**Value:** Your Vercel deployment URL
- Example: `https://udaysite.vercel.app`
- Or your custom domain: `https://uday007.in`

**Environment:** Production, Preview, Development

---

### 3. NextAuth Secret

**Variable Name:** `NEXTAUTH_SECRET`

**Value:** Generate a strong random secret (minimum 32 characters)

**Generate in PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Or use online generator:** [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

**Environment:** Production, Preview, Development

---

### 4. SMTP Host

**Variable Name:** `SMTP_HOST`

**Value:** `smtp.gmail.com` (or your email provider's SMTP server)

**Common values:**
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- Custom: Check your email provider's documentation

**Environment:** Production, Preview, Development

---

### 5. SMTP Port

**Variable Name:** `SMTP_PORT`

**Value:** `587`

**Environment:** Production, Preview, Development

---

### 6. SMTP User

**Variable Name:** `SMTP_USER`

**Value:** Your email address
- Example: `your-email@gmail.com`

**Environment:** Production, Preview, Development

---

### 7. SMTP Password

**Variable Name:** `SMTP_PASSWORD`

**Value:** Your email app password (NOT your regular email password)

**For Gmail:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Generate a new app password
4. Use that password here

**Environment:** Production, Preview, Development

---

### 8. SMTP From

**Variable Name:** `SMTP_FROM`

**Value:** Sender email address
- Example: `noreply@eggbator.com`
- Or: `your-email@gmail.com`

**Environment:** Production, Preview, Development

---

### 9. App Name

**Variable Name:** `APP_NAME`

**Value:** `Eggbator`

**Environment:** Production, Preview, Development

---

### 10. App URL

**Variable Name:** `APP_URL`

**Value:** Your production URL
- Example: `https://udaysite.vercel.app`
- Or: `https://uday007.in`

**Environment:** Production, Preview, Development

---

## Quick Checklist

Copy this checklist and check off each variable as you add it:

- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase JSON (single line)
- [ ] `NEXTAUTH_URL` - Your Vercel URL
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ chars)
- [ ] `SMTP_HOST` - `smtp.gmail.com`
- [ ] `SMTP_PORT` - `587`
- [ ] `SMTP_USER` - Your email
- [ ] `SMTP_PASSWORD` - App password
- [ ] `SMTP_FROM` - Sender email
- [ ] `APP_NAME` - `Eggbator`
- [ ] `APP_URL` - Your Vercel URL

---

## After Adding Variables

### Step 4: Redeploy Your Application

After adding all environment variables:

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Confirm the redeployment

**OR**

1. Make a small change to your code (add a comment)
2. Commit and push to trigger automatic deployment

---

## Verifying Environment Variables

### Check in Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Verify all variables are listed
3. Check that they're enabled for the correct environments

### Test Your Application

1. Visit your Vercel URL
2. Test registration/login
3. Test email sending (if configured)
4. Check Vercel logs for any errors

---

## Troubleshooting

### Build Fails: "FIREBASE_SERVICE_ACCOUNT_KEY not found"

**Solution:**
- Verify the variable is added in Vercel dashboard
- Check that it's enabled for Production environment
- Ensure JSON is valid (use a JSON validator)
- Redeploy after adding variables

### "NEXTAUTH_SECRET is missing"

**Solution:**
- Add `NEXTAUTH_SECRET` environment variable
- Generate a new secret (32+ characters)
- Redeploy

### Email Not Sending

**Solution:**
- Verify SMTP credentials are correct
- Check `SMTP_PASSWORD` is an App Password (not regular password)
- Verify `SMTP_FROM` matches your email domain
- Check Vercel function logs for SMTP errors

### Environment Variables Not Updating

**Solution:**
- Make sure you clicked "Save" after adding each variable
- Redeploy your application (variables only apply to new deployments)
- Check that variables are enabled for the correct environment (Production/Preview/Development)

---

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore` ✅
2. **Use different secrets for Production and Preview** (optional but recommended)
3. **Rotate secrets periodically** - Update `NEXTAUTH_SECRET` every few months
4. **Use App Passwords** - Never use your main email password
5. **Limit access** - Only add variables needed for each environment

---

## Quick Reference: Vercel Dashboard Path

```
Vercel Dashboard → Your Project → Settings → Environment Variables
```

**Direct URL format:**
```
https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

---

## Need Help?

- **Vercel Docs:** [https://vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Check Deployment Logs:** Vercel Dashboard → Deployments → Click on deployment → View logs
- **Test Locally:** Make sure your local `.env` file matches Vercel variables

---

**Pro Tip:** After adding all variables, take a screenshot of your environment variables list (with values hidden) for reference!

