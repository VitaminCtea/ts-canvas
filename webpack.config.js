const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const resolve = (_path) => path.resolve(__dirname, _path);

module.exports = {
    mode: "development",
    entry: ["webpack-hot-middleware/client?noInfo=true&reload=true", resolve("src")],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
    },
    devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".js", ".sass", ".css"],
        alias: {
            "@": resolve("src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|gif|jpg|svg|)$/,
                use: ["file-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "[name]-[hash:5].min.[ext]",
                            limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
                            publicPath: "fonts/",
                            outputPath: "fonts/"
                      }
                    }
                  ]
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "TypeScript图形渲染",
            template: './index.html'
        }),
    ],
    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: "all",
        },
    },
};
