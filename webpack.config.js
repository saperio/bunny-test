const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


module.exports = () => ({
    devtool: 'eval-cheap-module-source-map',
    entry: {
        main: './src/main.ts'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    devServer: {
        host: '0.0.0.0',
        port: '8091',
        static: ['build', 'assets']
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [
            new TsConfigPathsPlugin({})
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    }
});