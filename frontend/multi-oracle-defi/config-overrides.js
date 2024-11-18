const webpack = require("webpack");

module.exports = function override(config) {
  config.ignoreWarnings = [/Failed to parse source map/];

  config.resolve.fallback = {
    assert: require.resolve("assert/"),
    buffer: require.resolve("buffer/"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    stream: require.resolve("stream-browserify"),
    url: require.resolve("url/"),
    zlib: require.resolve("browserify-zlib"),
    vm: require.resolve("vm-browserify"),
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  return config;
};
