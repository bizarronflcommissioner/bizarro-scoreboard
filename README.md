# Bizarro Scoreboard Starter

This is your starter Next.js app for the Bizarro Fantasy Football League scoreboard.

## Quick Start

### 1. Create a new GitHub repo
1. Go to https://github.com/new
2. Name it **bizarro-scoreboard**
3. Make it **Public**
4. Click **Create repository**

### 2. Upload this project to GitHub
1. On your new repo page, click **Add file → Upload files**
2. Drag **everything inside this ZIP** into GitHub
3. Click **Commit changes**

### 3. Deploy on Railway
1. Go to https://railway.app
2. **New Project → Deploy from GitHub**
3. Select `bizarro-scoreboard`
4. Railway auto-detects **Next.js** and deploys

When finished, your app URL will look like:
`https://bizarro-scoreboard.up.railway.app/scoreboard`

### 4. Embed on MyFantasyLeague
1. Go to https://www.myfantasyleague.com
2. Log in as Commissioner → Setup → Appearance → Home Page
3. Add a new **Home Page Module**
4. Switch to **HTML** view and paste:

```html
<div style="max-width:1200px;margin:0 auto;">
  <iframe
    src="https://bizarro-scoreboard.up.railway.app/scoreboard"
    width="100%"
    height="1400"
    style="border:0;overflow:hidden;"
    loading="lazy"
    referrerpolicy="no-referrer"
  ></iframe>
</div>
```

Save and refresh your league homepage.

---

**Next Steps:** We'll add the branded scoreboard UI and live MFL integration later.
