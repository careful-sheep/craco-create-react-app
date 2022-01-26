const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const setEntry = () => {
    const files = glob.sync('./src/pages/**/index.tsx');
    const entry = {};
    for (const file of files) {
        const ret = file.match(/^\.\/src\/pages\/(\S*)\/index\.tsx$/);
        if (ret) {
            entry[ret[1]] = {
                import: file
            };
        }
    }
    return entry;
};

const getTemplate = name => {
    const files = glob.sync(`./src/pages/${name}/index.thymes.ejs`);
    if (files.length > 0) {
        return files[0];
    }
    return './public/index.thymes.ejs';
};

const setHtmlPlugin = () => {
    const files = glob.sync('./src/pages/**/index.tsx');
    const isEnv = process.env.NODE_ENV === 'development';
    const options = [];
    for (const file of files) {
        const ret = file.match(/^\.\/src\/pages\/(\S*)\/index\.tsx$/);
        if (ret) {
            const name = ret[1];
            const isIndex = name === 'index';
            options.push(
                new HtmlWebpackPlugin({
                    filename: isEnv ? (isIndex ? 'index.html' : `${name}/index.html`) : `${name}.thymes`,
                    template: getTemplate(name),
                    chunks: ['react_vendors', name],
                    title: name,
                    env: process.env.NODE_ENV
                })
            );
        }
    }
    return options;
};

module.exports = {
    setEntry,
    setHtmlPlugin
};
