# The Looking Glass

A quiet photo frame for the web. It pulls photos from a public iCloud Shared
Album and displays them full-frame, keeping each photo's real shape and filling
the edges with a soft blurred version of itself. Made to run in the browser on a
Facebook Portal (or any screen).

**This folder is ready to use. Don't move or rename anything inside it.**

```
looking-glass/
  index.html        the frame (do not rename)
  api/icloud.js     the helper that reads your album (do not move)
  README.md         this file
```

You'll need three free things: an Apple device (to make the shared album), a
GitHub account, and a Vercel account. Follow the steps in order.

---

## Step 1 — Make your iCloud album public

1. On your iPhone, open **Photos**.
2. Go to the **Albums** tab, tap **+**, choose **New Shared Album**, name it
   `Looking Glass`, and create it. (You don't need to invite anyone.)
3. Open the album, tap the **people icon** at the top, then
   **Shared Album Details**.
4. Turn on **Public Website**. A link appears — tap **Share Link** and send it
   to yourself. It looks like:
   `https://www.icloud.com/sharedalbum/#B0z5qAGN1JIFd3y`
   Keep this link; you'll paste it in later.
5. Add the photos you want on the frame into this album. Anything you add here
   later shows up on the frame automatically.

---

## Step 2 — Put this folder on GitHub

1. Create a new repository on GitHub (any name, e.g. `looking-glass`).
2. Upload the **contents** of this folder to it: `index.html`, the `api` folder,
   and `README.md`. The easiest way: on the new repo page, click
   **uploading an existing file**, then drag these items in and commit.

That's the whole repo. Nothing to build or configure.

---

## Step 3 — Deploy to Vercel

1. Go to vercel.com and sign in with GitHub.
2. Click **Add New → Project**, find your `looking-glass` repo, and click
   **Import**.
3. Leave every setting on its default and click **Deploy**.
4. When it finishes, copy your project's address. It looks like:
   `https://looking-glass-xxxx.vercel.app`

From that one address you now have two things you'll use:

- The frame:  `https://looking-glass-xxxx.vercel.app`
- The helper: `https://looking-glass-xxxx.vercel.app/api/icloud`

(Replace `looking-glass-xxxx` with your real address everywhere below.)

---

## Step 4 — Quick test that the helper works

In any browser, go to your helper address with your album token added on the
end. The **token** is the part of your iCloud link from Step 1 that comes
**after the `#`**. So if your link ends in `#B0z5qAGN1JIFd3y`, visit:

`https://looking-glass-xxxx.vercel.app/api/icloud?token=B0z5qAGN1JIFd3y`

- If you see a wall of text starting with `{"photos":` — it works. Continue.
- If you see an error message — it will tell you what's wrong (usually the
  album isn't public yet, or the token was mistyped). Fix that, then retry.

---

## Step 5 — Set up the frame

1. Open your frame address (`https://looking-glass-xxxx.vercel.app`) on a
   computer. A settings panel opens the first time.
2. Leave the source set to **iCloud album**.
3. In **Shared album link**, paste the full iCloud link from Step 1.
4. In **Proxy address**, paste your helper address:
   `https://looking-glass-xxxx.vercel.app/api/icloud`
5. Adjust anything you like — transition style, how often photos change, blur,
   clock. Click **Preview now** to watch it.
6. When you're happy, click **Save & copy frame link**. This bundles all your
   settings into one link and copies it. Send that link to yourself too.

---

## Step 6 — Put it on the Portal

1. On the Portal, open its **browser**.
2. Go to the **frame link** you copied in Step 5.
3. Leave it open, full-screen. Done.

---

## Good to know

- The **frame link** from Step 5 is the only thing you need to reopen the frame
  later. Save it somewhere you'll find it.
- To change anything (pace, transitions, even the album), reopen the frame
  address on your computer, adjust, click **Save & copy frame link** again, and
  reload that new link on the Portal.
- No proxy? For a quick test you can switch the source to **Image links** and
  paste direct image URLs — no Vercel needed.
- iCloud shrinks shared-album photos to about 2048px on the long edge. That's
  sharper than the Portal's screen, so it looks great.

---

## Controls while it's running

- Tap the screen (or move the mouse) to show the settings gear.
- Spacebar pauses and resumes. Left/right arrows step between photos.
- Press **S** to open settings.
