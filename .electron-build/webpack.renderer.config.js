'use strict';
process.env.BABEL_ENV = 'render';

const path = require('path');
const { dependencies } = require('../package.json');
const webpack = require('webpack');

const BabiliWebpackPlugin = require('babili-webpack-plugin'); // 基于babel的一款压缩工具
const CopyWebpackPlugin = require('copy-webpack-plugin'); //对静态资源进行拷贝 例如一些静态资源直接拷贝到打包后的文件夹中
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取单独打包css文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 动态构建html
const { VueLoaderPlugin } = require('vue-loader');

let whiteListModules = ['vue'];
const resolvePath = p => path.join(__dirname, '..', p);

let rendererConfig = {
  target: 'electron-renderer',
  devtool: '#cheap-module-eval-source-map', // 生成一个没有列信息（column-mappings）的SourceMaps文件，同时 loader 的 sourcemap 也被简化为只包含对应行的
  entry: {
    renderer: resolvePath('src/renderer/index.js')
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolvePath('dist/electron')
  },
  externals: [...Object.keys(dependencies || {}).filter(d => !whiteListModules.includes(d))],
  resolve: {
    alias: {
      '@': resolvePath('src/renderer'),
      vue$: 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', 'node']
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: ['vue-html-loader']
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: process.env.NODE_ENV === 'production',
            loaders: {
              scss: 'vue-style-loader!css-loader!sass-loader'
            }
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      nodeModules: process.env.NODE_ENV !== 'production' ? path.resolve('../node_modules') : false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = '';
  rendererConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new CopyWebpackPlugin([{ from: resolvePath('static'), to: resolvePath('dist/electron/static'), ignore: ['.*'] }])
  );
}

module.exports = rendererConfig;
