# Silver Price Calculator

A lightweight, browser-based silver price calculator built with HTML, CSS and JavaScript. It is deployed as a static site with GitHub Pages; Java and a backend server are not required.

## Features

- Set the silver price per gram in INR.
- Enter weight in grams and calculate instantly.
- Preserves the original making-charge rules:
  - Below 8 g: ₹65 fixed
  - 8 g to below 10 g: ₹25 fixed
  - 10 g through 29 g: ₹500–₹600
  - Above 29 g to below 30 g: ₹500 fixed
  - 30 g to below 40 g: ₹20 per gram
  - 40 g to below 50 g: ₹18 per gram
  - 50 g to below 70 g: ₹15 per gram
  - 70 g and above: ₹12 per gram
- Purple, dark and light themes.
- Responsive layout for mobile and desktop.

## Price storage

GitHub Pages serves static files and cannot write to the repository or keep a shared server-side price. The calculator therefore saves a changed price in the visitor's browser using local storage. Each visitor/device has its own saved price. A first-time visitor starts with the project's existing default of ₹200 per gram.

## Run locally

Open `site/index.html` in a browser. No build tools or Java installation are needed.

## Deploy with GitHub Pages

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push changes to the `master` branch. The workflow at `.github/workflows/deploy-pages.yml` publishes the `site/` directory.
4. When the workflow finishes, the website will be available at:

   https://adhi0068.github.io/Silver_Price_Calculator/

The original Spring Boot/Maven source remains in the repository under `src/`; the GitHub Pages version is the independent static site in `site/`.
