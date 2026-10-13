module.exports = function (eleventyConfig) {
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
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Sveltia CMS (the client's content editor) lives at /admin/. Copy its two files
  // verbatim; the admin folder is ignored below so Eleventy never renders them as pages.
  eleventyConfig.addPassthroughCopy("admin/index.html");
  eleventyConfig.addPassthroughCopy("admin/config.yml");

  // Don't let Eleventy touch the archived source-of-truth folder, its own output,
  // or the Sveltia admin files (copied verbatim above, never rendered).
  eleventyConfig.ignores.add("_netlify-final/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("admin/**");

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
