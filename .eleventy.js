const facts = require("./lib/facts.js");

module.exports = function (eleventyConfig) {
  // Business facts (hours, prices, phone, address) live only in _data/site.json, the file the
  // client edits. lib/facts.js builds everything else from it; see the note at its top.
  eleventyConfig.addGlobalData("hours_line", () => facts.hoursLine(facts.loadSite()));
  eleventyConfig.addFilter("withoutAddons", (list) => (list || []).filter((s) => !/add-?on/i.test(s.name)));
  // Fills {phone}, {price:Name}, {from:section} and the other tokens in page text, in every
  // built page and in llms.txt, including meta tags and the data Google reads.
  eleventyConfig.addTransform("facts", function (content) {
    const out = this.page && this.page.outputPath;
    if (typeof out !== "string" || !/.(html|txt)$/.test(out)) return content;
    return facts.fill(content, facts.loadSite());
  });
  eleventyConfig.on("eleventy.after", () => facts.reportProblems());

  // Static assets: passthrough-copy verbatim, no processing.
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("favicon-32.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("icon-192.png");
  eleventyConfig.addPassthroughCopy("icon-512.png");
  eleventyConfig.addPassthroughCopy("site.webmanifest");
  eleventyConfig.addPassthroughCopy("robots.txt");
  // llms.txt is built from llms.njk so its facts follow the editor.
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Prints editor-supplied text as a JavaScript string literal. "<" is escaped so a typed
  // "</script>" cannot end the inline script it sits in.
  eleventyConfig.addFilter("jsString", (v) => JSON.stringify(String(v == null ? "" : v)).replace(/</g, "\\u003c"));

  // Sveltia CMS (the client's content editor) lives at /admin/. Copy its two files
  // verbatim; the admin folder is ignored below so Eleventy never renders them as pages.
  eleventyConfig.addPassthroughCopy("admin/index.html");
  eleventyConfig.addPassthroughCopy("admin/config.yml");

  // Don't let Eleventy touch the archived source-of-truth folder, its own output,
  // or the Sveltia admin files (copied verbatim above, never rendered).
  eleventyConfig.ignores.add("_netlify-final/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("admin/**");
  eleventyConfig.ignores.add("lib/**");

  return {
    dir: {
      input: ".",
      output: "_site",
      // Conventional Eleventy dirs — explicit for clarity, these are already the defaults.
      includes: "_includes",
      data: "_data",
    },
  };
};
