const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');

const getHistoryFallbackConfig = paths => {
    const modelExist = filePath => {
        return !!paths.moduleFileExtensions.find(extension => fs.existsSync(`${filePath}.${extension}`));
    };

    const entries = [];
    fastGlob
        .sync(['*'], {
            onlyDirectories: true,
            cwd: path.join(paths.appSrc, 'pages'),
            absolute: true
        })
        .filter(pagePath => modelExist(path.join(pagePath, 'index')))
        .forEach(pagePath => {
            const entyName = path.basename(pagePath);
            entries.push({
                from: new RegExp('^/' + entyName + '$'),
                to: '/' + entyName + '.thymes'
            });
        });

    const indexRules = {
        from: /^\/$/,
        to: '/index.thymes'
    };
    return [indexRules, ...entries];
};

module.exports = getHistoryFallbackConfig;
