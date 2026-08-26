# Project operating memory

## Reels and video research workflow

The rules below are mandatory for every future Facebook Reels or YouTube research task in this repository.

1. Use the `aside-browser` skill and Aside for browser work that depends on logged-in sessions. For Facebook Reels inventory, open the channel's Reels tab and keep scrolling until no new unique reel ID is loaded. Do not treat the first viewport as the full inventory. Record the audit date, canonical URL, and deduplicated IDs.
2. Reconcile counts from actual data objects, never from text or regex matches such as every `id:` occurrence. For each channel, registry count, declared `reelCount`, rendered item count, unique ID count, and audited inventory count must agree. Methodology or summary arrays must not contain reel objects.
3. Acquire metadata, duration, publish date, thumbnail, usable captions, and representative frames for every item. Keep the original reel URL and ID as the stable key.
4. Analyze the video's spoken and visual content, not only its title or post description. Prefer a complete platform caption when it is usable. If captions are missing, incomplete, or clearly sparse, download the audio and transcribe locally with `mlx-community/whisper-large-v3-turbo`. A video of at least five minutes with fewer than 40 caption words per minute is considered incomplete and must use local transcription.
5. If a video has no usable audio, use its post caption together with representative frames/contact sheets and label that evidence path explicitly. Never present this fallback as a speech transcript.
6. Build each site entry from transcript and frame evidence. Include the real topic, concrete instructions or rules, important claims and CTA, and missing risk controls such as stop, exit, position size, or costs. Store transcript source and word count. Do not publish a title-only placeholder or copy the complete raw transcript into the site.
7. Preserve raw media, full transcripts, metadata, and contact sheets as local audit artifacts. Do not commit large artifact directories or authentication/session data.
8. Before declaring a channel complete, run:
   - `npm run reels:progress`
   - `npm run reels:verify-quality`
   - `npm run build`
   - Aside browser QA on the global Reels page and the channel detail page
9. A completion report must distinguish audited inventory, analyzed/rendered items, deferred items, and pending items. Do not claim “all videos” unless infinite-scroll saturation and the count invariants have both been verified.
10. The canonical source is `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_research`. The public deployment repository is `/Users/masterp/Projects/superwork/signal-note`. After approved publication, sync managed source files while excluding `.git`, `node_modules`, `dist`, `.DS_Store`, and `artifacts`; re-run validation in the deployment repository; then commit and push `signal-note/main`.

The detailed 2026-08-26 baseline audit is in the research project's `docs/reels/transcript-rework-audit-2026-08-26.md`.
