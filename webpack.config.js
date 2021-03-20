const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = {
  mode: 'development',
  devtool:'source-map',
  module:{
    rules:[
        {
            test: /.*(png|jpe?g|gif)$/i,
            loader: 'file-loader',
            options:{
                name: '[path][hash].[ext]'
            },
            exclude: /node_modules/
        },
        {
            test: /\.tsx?$/,
            use: [
            {
                loader: 'ts-loader'
            }
            ],
            exclude: /node_modules/
        },
        {
            test: /\.s[ac]ss$/i,
            use: [
              // Creates css files
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  esModule: true
                },
              }
              ,
              "@teamsupercell/typings-for-css-modules-loader",
              // Translates CSS into CommonJS
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[path][name]__[local]--[hash:base64:5]'
                  }
                }
              },
              'sass-loader'
            ],
            exclude: /node_modules/
        }
    ]
},
resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      resources: path.resolve(__dirname, 'resources/')
    } 
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:"popup/main.css"
    })
  ],
watch: true,
watchOptions: {
    ignored: ['/node_modules', '*.d.ts']
  }
}

const background =  Object.assign({}, common, {
  entry: './src/background.tsx',
  output: {
      filename: 'background.js',
      path: path.resolve(__dirname, 'dist'),
  }
});

const popup =  Object.assign({}, common, {
  entry: './src/index.tsx',
  output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist', 'popup'),
  }
});
module.exports = [
  background,
  popup
];