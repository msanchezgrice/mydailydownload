# My Daily Download Brand Asset Kit

Generated for T11 Brand / social assets.

## Source
- Brand system: `/Users/miguel/MyDailyDownload/design/DESIGN.md`
- Launch brief: `/Users/miguel/MyDailyDownload/launcher/design-brief.md`
- Render script: `launcher/brand-assets/render-assets.mjs`

## Exports
- SVG masters: `launcher/brand-assets/exports/svg/`
- PNG exports: `launcher/brand-assets/exports/png/`
- JPG exports: `launcher/brand-assets/exports/jpg/`
- Public app assets: `web/public/brand-assets/`
- Manifest: `launcher/brand-assets/exports/asset-manifest.json`

## Platform Files
- Default OG card: `web/public/brand-assets/og-default.png`
- Per-career OG cards: `web/public/brand-assets/og-ai-for-*.png`
- X avatars: `launcher/brand-assets/exports/png/avatar-*-400.png`
- X covers: `launcher/brand-assets/exports/png/x-cover-*-1500x500.png`
- Facebook avatar: `launcher/brand-assets/exports/png/facebook-avatar-170.png`
- Facebook cover: `launcher/brand-assets/exports/png/facebook-cover-820x312.png`
- YouTube banner: `launcher/brand-assets/exports/png/youtube-banner-2560x1440.png`
- Story/reel covers: `launcher/brand-assets/exports/png/story-cover-*-1080x1920.png`
- Square organic/ad creative: `launcher/brand-assets/exports/png/ad-square-*-1080x1080.png`

## Regeneration
Run from `web/` so the local `sharp` dependency is available:

```bash
node ../launcher/brand-assets/render-assets.mjs
```

Public posting, paid spend, and provider account mutations remain approval-gated.
