# Gold + Silver calculator source

This branch contains the combined static GitHub Pages calculator in `site/` and the supplied Gold source snapshots in `source/`.

## GitHub Pages version

- Entry page: `site/index.html`
- Styles: `site/style.css`
- Browser logic: `site/script.js`
- No Spring Boot API is required to run the Pages version.
- Gold and Silver settings are stored separately in the visitor's browser using localStorage. They are not shared between devices or visitors.
- The initial Gold price and rate are taken from the supplied `source/data/gold-price.txt` file. The initial Silver price remains the default already present in the existing static Silver site.

## Calculation behavior

- Gold: `base = pricePerGram × weight`; `rateAmount = base × rate / 100`; final amount is base plus rate amount.
- Silver: retains the calculation behavior of the existing `site/index.html` static calculator on the base branch.

The original uploaded Gold Java files, HTML, CSS, JavaScript, and price data are retained under `source/` for reference. The original Java Silver implementation remains in `src/`.
