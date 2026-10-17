# Asking the World

Project website: https://asking-the-world.github.io/

Paper: https://arxiv.org/abs/2609.39135

A static project website with author information, abstract, method figures, video examples, benchmark results, and ablation studies checked against arXiv v1. No build step is required.

Main results reproduce Tables 2 and 3, and real-world charts use per-question accuracy from Table 4. Ablations use Figure 6, full-precision physical-grounding results from Table 6, and foundation-model comparisons from Section 4.3. Best and second-best table entries preserve the paper's comparison semantics.

Video examples use synchronized, muted playback. Scene controls support hover, click, and keyboard navigation; animations respect reduced-motion preferences. The layout draws on SimpleTouch, PhysMind, and VIGA.

## Local preview

Run `python -m http.server 8000 --bind 127.0.0.1` in this directory and open http://127.0.0.1:8000/.

## GitHub Pages

Deploy tracked files from the `main` branch at `/` (root). Preserve `.nojekyll`. Ignored local material is not a deployment input; do not upload the entire working directory.
