import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';

const config: webpack.Configuration = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
};

module.exports = (env: any, argv: any) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  if (argv.mode === 'production') {
    config.devtool = undefined;

    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            mangle: true,
            compress: {
              warnings: false, // Suppress uglification warnings
              pure_getters: true,
              unsafe: true,
              unsafe_comps: true,
            },
            output: {
              comments: false,
            },
            ie8: false,
          },
        }),
      ],
    };
  }

  return config;
};
