# A Concepting Tool with Svelte.js

This project uses Svelte.js to allow the user to select a page from the local /pages/ repository and tweak its styling with a live preview and shareable URLs. Great for teams who are trying to pin down the concept of a brand or site buildout before they design too many pages.

## How to use it
1. Fork the repo
2. Host the site (I have it as a subdirectory of my Github Pages portfolio site. Netlify is easy too.)
3. Code up a few main landing pages you want to see various styles of, with the special considerations mentioned below.
4. Drop those files into the /pages/ directory of your repo.
5. (For now) update the "availablePages" array at the top of the App.svelte file (I'm making this automatic soon)
6. Re-deploy your site
7. Use the UI to tweak your designs during a meeting, saving links to looks you like as you go!

## Designing pages for the tool
### HTML & JS
You can use any tool to create your pages as long as the HTML file for it lands in the /pages/ directory. I haven't done this, but you could even use a framework like Vue or an SSG like Gatsby to put a whole site in there!

### CSS
This tool is however very opinionated about how you do your CSS, which may feel odd. The tool relies on *locally-hosted, globally-scoped CSS variables*, that is CSS variables placed in local stylesheets (not hosted like UIKit or Bootstrap) at the global scope (CSS selectors must either be *, :root, or body). This is to prevent pollution and provide just the right amount of control to the tool over your page.

This means that if you want to see what different `border-radius` values look like on your secondary button, you'll have to make a CSS variable called something like `--secondary-btn-border-radius` within a root level CSS rule, then use that variable in your initial styling. The names may get long but it really is worth it for readability and namespacing. The tool even generates the labels for the controls from your CSS variable names! So just write some longer names so your design colleagues don't have to guess that `--bs-2` stands for your secondary box shadow style 😂.

## More Info
This tool was made by [Frank Noirot](http://franknoirot.co) [in 2020](https://elizabethwarren.com).

If you want to get in touch, email him at frank@franknoirot.co or @franknoirot on insta.