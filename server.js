const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require('webpack-hot-middleware')

const app = express()
const config = require("./webpack.config.js")
const compiler = webpack(config)
const PORT = 3000

// 告知 express 使用 webpack-dev-middleware，
// 以及将 webpack.config.js 配置文件作为基础配置。
app.use(
    webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        quiet: true
    })
)

app.use(
    webpackHotMiddleware(compiler, {
        log: false,
        heartbeat: 2000
    })
)

app.use(express.static('image'))

app.use(express.static('public'))

// 将文件 serve 到 port 3000。
app.listen(PORT, function () {
    console.log("Example app listening on port 3000!\n")
})
