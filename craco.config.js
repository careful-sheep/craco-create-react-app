const {setEntry, setHtmlPlugin} = require('./config/htmlConfig.util');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            const isEnvDevelopment = env === 'development';
            const isEnvProduction = env === 'production';

            // SPA to MPA need to modify output.filename配置
            // SPA 在 Dev环境下的配置为'static/js/bundle.js'
            // 所有js文件都打包在static/js目录下，上面的命名方式会导致命名冲突，故加[name]做区分
            webpackConfig.output.filename = isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/[name].bundle.js';

            // 修改entry，通过glob-fast读取pages目录，单入口改为多入口
            webpackConfig.entry = setEntry();

            // SPA HtmlWebpackPlugin的初始index值
            let htmlPluginIndex = 0;
            webpackConfig.plugins.forEach((pluginItem, index, self) => {

                // 需要重新修改ManifestPlugin的generage方法
                // 多页应用的entrypoints是一个对象，单页应用是一个数组
                // 如果不修改，entrypoints.main.filter会报错Cannot read property 'filter' of undefined
                if (pluginItem instanceof WebpackManifestPlugin && self[index]['options']) {
                    self[index]['options']['generate'] = (seed, files, entrypoints) => {
                        const manifestFiles = files.reduce((manifest, file) => {
                            manifest[file.name] = file.path;
                            return manifest;
                        }, seed);
                        const entrypointFiles = [];
                        Object.entries(entrypoints).forEach(([key, fileList]) => {
                            fileList.forEach((fileName) => {
                                if (!fileName.endsWith('.map')) {
                                    entrypointFiles.push(fileName);
                                }
                            });
                        });
                        return {
                            files: manifestFiles,
                            entrypoints: entrypointFiles
                        };
                    }
                }

                // 记录HtmlWebpackPlugin在plugins中的index值，不能在这里替换，会导致数组长度产生变化，出现bug
                if (pluginItem instanceof HtmlWebpackPlugin) {
                    htmlPluginIndex = index;
                }
            });

            // 替换为多页应用的HtmlWebpackPlugin
            webpackConfig.plugins.splice(htmlPluginIndex, 1, ...setHtmlPlugin());
            return webpackConfig;
        }
    }
}