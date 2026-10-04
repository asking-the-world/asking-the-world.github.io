# Project Instructions

## Purpose and Repository Boundaries

- Build the project website for Asking the World (ATW).
- Keep this website repository separate from the paper repository.
- Treat the local paper repository as read-only unless explicitly instructed otherwise. Keep its local location in ignored configuration, never in tracked files.
- Keep page source in `src/` and approved public assets in `public/assets/`.
- Public pages must be self-contained; do not depend on the local paper checkout at runtime.

## Communication and Coding

- Start every reply with `Zengshenxiang`.
- Before writing code, explain the proposed approach and wait for the user's approval. An explicit request to implement an already explained approach counts as approval.
- If the request is ambiguous, clarify before writing code.
- Do not add backward compatibility or compatibility layers unless explicitly requested.

## Public Content and Privacy

- The current authorized public content is the paper title, authors, affiliations, contribution marks, personal-page links, published paper links, and Coming Soon message.
- Do not upload or commit experiment details, numerical results, tables, plots, case examples, videos, datasets, logs, drafts, or internal research material without explicit approval for those specific contents. This applies even if the content also appears in a public paper.
- Copying assets for local preparation does not authorize publication. Store such material only in ignored `.private-assets/` or outside this repository, never under `public/`.
- Local ignored files are not website deployment inputs. Never publish the entire local checkout as an archive.
- Do not commit personal machine paths, private contact details, credentials, tokens, private keys, or environment configuration.
- Use the account's GitHub noreply email for commits; do not expose a personal email in author or committer metadata.
- Review the staged diff and asset list for public suitability before every commit and push. Do not force-add ignored private material.

## Website Design and Content

- Follow the PhysMind project's layout and visual language as requested. Keep branding and content specific to ATW.
- For shared authors, reuse their verified public personal-page links from PhysMind.
- Verify author order, affiliations, equal-contribution marks, and corresponding-author marks against https://arxiv.org/abs/2609.39135.
- Keep the page as Coming Soon until further content is explicitly approved.
- For subsequently approved content, use wording from the paper where possible; do not invent names, claims, or phrases.
- Preserve the values and comparison semantics of any explicitly approved result table.
- Distinguish main-paper and appendix content when the user explicitly approves figures for publication.
- Do not copy third-party reference images into public assets.
- Use only verified resource URLs. Do not invent code repositories or paper links.
- Verify approved videos play correctly and use muted, looping playback where appropriate.

## Verification and GitHub Pages

- Verify links, approved media, and any production build before delivery. This static site currently requires no Node.js build.
- Check visual rendering at 320, 390, 768, 1024, and 1440 pixels: title and author wrapping, font loading, and horizontal overflow.
- If the session browser tool is unavailable, use the installed Chrome in headless mode with isolated temporary profiles.
- For mobile widths, use device-metrics emulation; a headless window-size flag alone can produce a wider layout cropped to the screenshot.
- Keep screenshots and temporary profiles outside tracked source. Close only browser instances created for the check.
- Use GitHub Pages at https://asking-the-world.github.io/, deploying tracked files from `main` at the repository root. Preserve `.nojekyll`.
- After publishing, verify the live page and its linked public assets. A successful push alone does not prove deployment.

## Local Frontend Skills

- `.agents/skills/frontend-design/SKILL.md` provides visual-design guidance.
- `.agents/skills/frontend-ui-engineering/SKILL.md` provides implementation, accessibility, and responsive-layout guidance.
- Apply these proportionately to a static academic project page. The user's requested PhysMind-inspired design takes precedence over generic suggestions.
