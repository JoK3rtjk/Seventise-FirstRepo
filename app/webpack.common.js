const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          import: true,
        },
      },
    ],
    rules: [
      {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          modules: true,
        },
      },
    ],
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  // mode: 'development',
  entry: {
    filename: "./src/indexSeven.js"
  },

  output: {
    filename: '[index].bundle.js',
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "./src/Seventise.html", to: "index.html" }])
    // new CopyWebpackPlugin([{from: "./src/marketplace.html", to: "marketplace.html"}])
  

  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
