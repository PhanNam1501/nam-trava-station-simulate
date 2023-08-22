const path = require("path");

module.exports = {
  mode: "none",
  entry: "./src/index.ts",
  target: "node",
  output: {
    library: "trava-station-simulation",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "umd"),
    filename: "index.js",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-typescript",
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  externals: ["decimal.js", "@zennomi/tokens", "ethers"],
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};
