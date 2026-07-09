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

  // Don't let Eleventy touch the archived source-of-truth folder or its own output.
  eleventyConfig.ignores.add("_netlify-final/**");
  eleventyConfig.ignores.add("node_modules/**");

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
