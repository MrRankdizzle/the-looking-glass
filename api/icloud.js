// api/icloud.js
// A tiny proxy that turns a public iCloud Shared Album into clean JSON.
//
// Why this exists: Apple's shared-album feed (the "sharedstreams" API) blocks
// direct browser calls with CORS, so your Portal can't read it itself. This
// runs server-side, does the two Apple calls, and hands your slideshow a simple
// list of { url, width, height, caption, date }. It adds the CORS header so the
// browser app is allowed to call it.
//
// Deploy: drop this file at /api/icloud.js in a Vercel project and push.
// It needs no dependencies (Node 18+ has global fetch on Vercel).
//
// Call it like:  https://your-project.vercel.app/api/icloud?token=B0z5qAGN1JIFd3y
// where the token is the part after the # in your album's share link:
//   https://www.icloud.com/sharedalbum/#B0z5qAGN1JIFd3y

export default async function handler(req, res) {
  // Let the browser app call this from anywhere.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = (req.query.token || '').toString().trim();
  // Accept a full share URL or just the bare token.
  const token = raw.includes('#') ? raw.split('#').pop() : raw;
  if (!token) {
    return res.status(400).json({ error: 'Add ?token= with your shared album token.' });
  }

  try {
    const photos = await getAlbum(token);
    if (!photos.length) {
      return res.status(200).json({
        photos: [],
        note: 'The album loaded but had no displayable photos. Videos are skipped.',
      });
    }
    // Cache at the edge so we don't hammer Apple on every slide change.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({ photos });
  } catch (err) {
    return res.status(502).json({
      error: 'Could not reach that album. Check that sharing is turned on and the token is right.',
      detail: String(err && err.message ? err.message : err),
    });
  }
}

async function getAlbum(token) {
  // Start at any partition; Apple tells us the right host to use, and we retry.
  let base = `https://p01-sharedstreams.icloud.com/${token}/sharedstreams/`;

  let stream = await postJson(base + 'webstream', { streamCtag: null });
  const host = stream.body && stream.body['X-Apple-MMe-Host'];
  if (host) {
    base = `https://${host}/${token}/sharedstreams/`;
    stream = await postJson(base + 'webstream', { streamCtag: null });
  }

  const data = stream.body || {};
  const rawPhotos = Array.isArray(data.photos) ? data.photos : [];

  // For each photo, keep the largest still-image derivative and its dimensions.
  const guids = [];
  const bestByGuid = {};
  for (const p of rawPhotos) {
    if (p.mediaAssetType === 'video') continue; // <img> can't show these
    const derivs = Object.values(p.derivatives || {});
    let best = null;
    for (const d of derivs) {
      if (!d || !d.checksum) continue;
      const size = parseInt(d.fileSize || '0', 10);
      if (!best || size > best._size) best = { ...d, _size: size };
    }
    if (!best) continue;
    bestByGuid[p.photoGuid] = {
      checksum: best.checksum,
      width: parseInt(best.width || '0', 10) || 0,
      height: parseInt(best.height || '0', 10) || 0,
      caption: p.caption || '',
      date: p.dateCreated || p.batchDateCreated || '',
    };
    guids.push(p.photoGuid);
  }

  if (!guids.length) return [];

  // Ask Apple for the signed CDN URLs, keyed by checksum.
  const assets = await postJson(base + 'webasseturls', { photoGuids: guids });
  const items = (assets.body && assets.body.items) || {};

  const out = [];
  for (const guid of guids) {
    const info = bestByGuid[guid];
    const item = items[info.checksum];
    if (!item || !item.url_location || !item.url_path) continue;
    out.push({
      url: `https://${item.url_location}${item.url_path}`,
      width: info.width,
      height: info.height,
      caption: info.caption,
      date: info.date,
    });
  }
  return out;
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await r.text();
  let parsed = {};
  try { parsed = JSON.parse(text); } catch (_) { /* leave as {} */ }
  return { status: r.status, body: parsed };
}
