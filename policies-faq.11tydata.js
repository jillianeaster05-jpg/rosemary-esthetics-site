// Per-template data file (Eleventy's own data-cascade convention, not a sandboxed
// JS front matter block, since this project's Node/Eleventy setup runs front matter
// JS in a vm sandbox that has neither `require` nor a working dynamic `import`).
//
// This computes the FAQPage JSON-LD straight from the SAME faq.items array that the
// visible FAQ accordion in policies-faq.njk loops over (_data/pages/policies_faq.json),
// so the visible questions/answers and the schema can never drift apart.
function stripTags(html) {
  return html.replace(/<[^>]+>/g, "");
}

module.exports = {
  eleventyComputed: {
    extra_jsonld: (data) => {
      const items = data.pages.policies_faq.faq.items;
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.plain_answer || stripTags(item.answer),
          },
        })),
      };
    },
  },
};
