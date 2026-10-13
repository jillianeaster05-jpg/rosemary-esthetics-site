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

  // Sveltia CMS admin shell: publish only these two files at /admin/, verbatim,
  // with no template processing. admin/parts/*.yml are per-page config snippets
  // the studio pastes into admin/config.yml by hand; they are never meant to
  // ship and must never be copied into the built site.
  eleventyConfig.addPassthroughCopy("admin/index.html");
  eleventyConfig.addPassthroughCopy("admin/config.yml");

  // Don't let Eleventy touch the archived source-of-truth folder, its own
  // output, or the Sveltia config parts that are not meant to ship.
  eleventyConfig.ignores.add("_netlify-final/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("admin/parts/**");

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
