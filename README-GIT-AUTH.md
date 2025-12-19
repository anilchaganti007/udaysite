# Git Account Switching Guide

This repository is configured to use the **anilchaganti007** GitHub account.

## Current Setup
- **Local Git User**: anilchaganti007
- **Repository**: https://github.com/anilchaganti007/udaysite.git
- **Global Git User**: chagantianil (for other repositories)

## How to Push to This Repository

### Method 1: Use Personal Access Token (Recommended)

1. Create a Personal Access Token:
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Copy the token

2. Push using the token:
   ```bash
   git push https://YOUR_TOKEN@github.com/anilchaganti007/udaysite.git main
   ```
   Or when prompted during normal push, use:
   - Username: `anilchaganti007`
   - Password: `YOUR_TOKEN` (not your GitHub password)

### Method 2: Clear Credentials and Re-authenticate

1. Open Windows Credential Manager:
   - Press `Win + R`, type `control /name Microsoft.CredentialManager`
   - Go to "Windows Credentials"
   - Find and remove any `git:https://github.com` entries

2. Try pushing again - it will prompt for new credentials:
   ```bash
   git push -u origin main
   ```
   Use `anilchaganti007` as username and your Personal Access Token as password.

### Method 3: Use SSH (Alternative)

If you have SSH keys set up for anilchaganti007:
```bash
git remote set-url origin git@github.com:anilchaganti007/udaysite.git
git push -u origin main
```

## Switching Between Accounts

- **For this repo (anilchaganti007)**: Already configured locally
- **For other repos (chagantianil)**: Uses global config automatically

The local config in this repo overrides the global config, so you can work with both accounts seamlessly!

