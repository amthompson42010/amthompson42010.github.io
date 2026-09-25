# amthompson42010.github.io

Personal portfolio for Alexander Thompson. Plain static HTML, CSS and JS — no build step.

```
index.html          page content
assets/style.css    styles
assets/main.js      copy-email button + animated contour background
favicon.svg
.nojekyll           tells GitHub Pages to serve files as-is
```

## Publish to GitHub Pages

1. Create a **public** repo on GitHub named exactly `amthompson42010.github.io`.
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/amthompson42010/amthompson42010.github.io.git
   git push -u origin main
   ```

3. In the repo, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.
4. After a minute or two the site is live at https://amthompson42010.github.io/

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Updating

Edit `index.html`, then `git commit -am "Update" && git push`. GitHub Pages redeploys automatically.
