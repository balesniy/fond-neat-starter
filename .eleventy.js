const yaml = require("js-yaml");
const {DateTime} = require("luxon");
const htmlmin = require("html-minifier");
const embeds = require("eleventy-plugin-embed-everything");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const pluginRss = require("@11ty/eleventy-plugin-rss");

const dateFilter = require('./src/filters/date-filter.js');

module.exports = function (eleventyConfig) {
    // Disable automatic use of your .gitignore
    eleventyConfig.setUseGitIgnore(false);

    // Merge data instead of overriding
    // https://www.11ty.dev/docs/data-deep-merge/
    eleventyConfig.setDataDeepMerge(true);

    // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addPlugin(pluginRss);

    // Add filters
    eleventyConfig.addFilter("randomItem", (arr) => {
        arr.sort(() => {
            return 0.5 - Math.random();
        });
        return arr.slice(0, 1);
    });

    eleventyConfig.addFilter('dateFilter', dateFilter);

    // human readable date
    eleventyConfig.addFilter("readableDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat(
            "dd LLL yyyy"
        );
    });

    // Filter using `Array.filter`
    eleventyConfig.addCollection("keyMustExistInData", function (collectionApi) {
        return collectionApi.getAll().filter(function (item) {
            // Side-step tags and do your own filtering
            return "myCustomDataKey" in item.data;
        });
    });

    // Get only content that matches a tag
    eleventyConfig.addCollection("myTravelPostsWithPhotos", function (collectionApi) {
        return collectionApi.getFilteredByTags("post", "travel", "photo");
    });

    eleventyConfig.addCollection('work', collection => {
        return collection
            .getFilteredByGlob('./src/work/*.md')
            .sort((a, b) => (Number(a.data.displayOrder) > Number(b.data.displayOrder) ? 1 : -1));
    });

    eleventyConfig.addCollection("myCustomSort", function (collectionApi) {
        return collectionApi.getAll().sort(function (a, b) {
            //return a.date - b.date; // sort by date - ascending
            return b.date - a.date; // sort by date - descending
            //return a.inputPath.localeCompare(b.inputPath); // sort by path - ascending
            //return b.inputPath.localeCompare(a.inputPath); // sort by path - descending
        });
    });

    // Automatically transform 💀boring URLs💀 into ✨embedded media✨
    eleventyConfig.addPlugin(embeds);

    // To Support .yaml Extension in _data
    // You may remove this if you can use JSON
    eleventyConfig.addDataExtension("yaml", (contents) =>
        yaml.safeLoad(contents)
    );

    // Copy Static Files to /_Site
    eleventyConfig.addPassthroughCopy({
        "./src/admin/config.yml": "./admin/config.yml",
        "./node_modules/alpinejs/dist/alpine.js": "./static/js/alpine.js",
    });
    eleventyConfig.addPassthroughCopy("src/admin");
    eleventyConfig.addPassthroughCopy("src/_includes/assets/");

    // Copy Image Folder to /_site
    eleventyConfig.addPassthroughCopy("./src/static/img");

    // Copy favicon to route of /_site
    eleventyConfig.addPassthroughCopy("./src/favicon.ico");

    // Minify HTML
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        // Eleventy 1.0+: use this.inputPath and this.outputPath instead
        if (outputPath.endsWith(".html")) {
            return htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
        }

        return content;
    });

    // Let Eleventy transform HTML files as nunjucks
    // So that we can use .html instead of .njk
    return {
        dir: {
            input: "src",
        },
        htmlTemplateEngine: "njk",
    };
};
