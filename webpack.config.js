'use strict';
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const buildingForLocal = () => {
  return (NODE_ENV === 'development');
};

// todo Trying to generate multiple html files passing just and array of the pages path.
// function generateHTMLTemplate(temaplateDir) {
//   temaplateDir.map(template => {
//     const parts = template.split('/');
//     const dirName = parts[2];
//     const page = parts[3];
//     return new HtmlWebPackPlugin({
//       filename: `${dirName}/index.html`,
//       template: `./src/pug/pages/${dirName}/${page}`
//       // template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
//     })
//   })
// }

const config  = {
  mode: buildingForLocal() ? 'development' : 'production',
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './assets/js/index.js'
  },
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/js/[name].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      "node_modules"
    ]
  },
  devServer: {
    quiet: true
  },
  devtool: buildingForLocal() ? 'cheap-module-eval-source-map' : undefined,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.pug$/,
        loaders: 'pug-loader',
        // Add this option to disable minification when building
        query: {
          pretty: true
        }
      },
      {
        test: /\.(scss|css)/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                url: true,
                sourceMap: true,
                minimize: true
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: [
                  // Generate vendor prefixes
                  require('autoprefixer')({
                    'browsers': ['> 1%', 'last 2 versions']
                  })
                ]
              },
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
                sourceMap: true
              }
            }
          ]
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 40000,
              name: '[name].[ext]',
              outputPath : 'assets/images/',
              publicPath : function(path){
                  return '../images/' + path;
              }
            }
          }
        ]
      },
      {
        test: /\.(ttf|otf|eot|woff|woff2|svg)$/,
        loader: "file-loader",
        options: {
          name: '[name].[ext]',
          outputPath : 'assets/fonts/',
          publicPath : function(path){
              return '../fonts/' + path;
          }
        }
      }
      // If you want use jQuery in your project
      // - Install necessary packages:
      //  npm i -S jquery
      //  npm i -D expose-loader
      // ,{
      //   test: require.resolve('jquery'),
      //   use: [{
      //     loader: 'expose-loader',
      //     options: 'jQuery'
      //   },{
      //     loader: 'expose-loader',
      //     options: '$'
      //   }]
      // }
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new ExtractTextPlugin('./assets/css/style.css'),
    new CopyWebpackPlugin([
      {
        from:'./assets/images',
        to:'./assets/images',
        ignore: ['.*']
      }
    ]),
    new CopyWebpackPlugin([
      {
        from:'./assets/fonts',
        to:'./assets/fonts',
        ignore: ['.*']
      }
    ]),
    new HtmlWebPackPlugin({
      template: "./pug/index.pug",
      filename: "index.html",
      inject: true,
      chunksSortMode: 'dependency'
    }),
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: 'http://localhost:8080/'
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    )
  ]
}

if (NODE_ENV === 'production') {
  module.exports.devtool = 'source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i })
  ])
  config.optimization.minimizer = [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
    })
  ]
}

module.exports = config;