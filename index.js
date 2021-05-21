
const webpack = require('webpack');

const path = require('path');
const url = require('url');
const uglifyJs = require('uglify-js');
const build = require('modernizr').build;

process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();

class ModernizrPlugin {
    constructor(options) {
        options = options || {};
        // ensure extension on filename
        if (options.filename && !options.filename.match(/\.js$/)) {
            options.filename = options.filename + '.js';
        }

        // regression support for namechange 1.0.0+
        if (options.htmlWebPackPluginIntegration !== undefined) {
            options.htmlWebpackPlugin = options.htmlWebPackPluginIntegration;
        }

        this.options = Object.assign({}, {
            filename: 'modernizr-bundle.js',
            htmlWebpackPlugin: true,
            minify: process.env.NODE_ENV === 'production',
            noChunk: false
        }, options);
    }

    htmlWebpackPluginAddHtmlAsset(
        htmlWebpackPlugin,
        buildOptions,
        compilation,
        outputHash,
        rawModernizrSource
    ) {
        const hooks = htmlWebpackPlugin.constructor.getHooks(compilation);

        hooks.beforeAssetTagGeneration.tap(
            'ModernizrWebpackPlugin',
            (htmlPluginData) => {
                let oFilename = this.getOutputFilename(
                    buildOptions,
                    outputHash,
                    compilation
                );

                compilation.emitAsset(oFilename, rawModernizrSource);

                return htmlPluginData;
            }
        );
    }

    htmlWebpackPluginInjectScriptTag(
        htmlWebpackPlugin,
        buildOptions,
        compilation,
        outputHash
    ) {
        const hooks = htmlWebpackPlugin.constructor.getHooks(compilation);

        hooks.alterAssetTags.tap(
            'ModernizrWebpackPlugin',
            (htmlPluginData) => {
                let oFilename = this.getOutputFilename(
                    buildOptions,
                    outputHash,
                    compilation
                );
                const publicPath = this.resolvePublicPath(
                    compilation,
                    buildOptions.filename
                );
                const filePath = this.createOutputPath(
                    oFilename,
                    publicPath,
                    htmlWebpackPlugin.options.hash ? compilation.hash : null
                );
                const moderizrScriptTag = {
                    tagName: 'script',
                    voidTag: false,
                    attributes: {
                        src: filePath
                    }
                };
                htmlPluginData.assetTags.scripts.push(moderizrScriptTag);

                return htmlPluginData;
            }
        );
    }

    minifySource(source, options) {
        const uglifyOptions = Object.assign({}, options);
        const result = uglifyJs.minify(source, uglifyOptions);

        return result.code;
    }

    /**
    * Copied from html-webpack-plugin
    * @param {Object} compilation
    * @param {string} filename
    * @returns {string} Webpack public path option
    * @private
    */
    resolvePublicPath(compilation, filename) {
        let publicPath = typeof compilation.options.output.publicPath !== 'undefined' ?
            compilation.getAssetPath(compilation.outputOptions.publicPath, {}) :
            path.relative(path.dirname(filename), '.');

        if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
            publicPath = path.join(url.resolve(publicPath + '/', '.'), '/');
        }

        return publicPath
    }

    createHash(output, length) {
        const hash = require('crypto').createHash('md5');
        hash.update(output);
        return hash.digest('hex').substr(0, length);
    }

    createOutputPath(oFilename, publicPath, hash) {
        let result = oFilename;

        if (publicPath) {
            result = publicPath + oFilename;
        }
        if (hash) {
            result = result + (result.indexOf('?') === -1 ? '?' : '&') + hash;
        }

        return result;
    }

    validatePlugin(plugin) {
        return !(
            typeof plugin !== 'object' 
            ||  plugin.constructor.name !== 'HtmlWebpackPlugin'
            ||  plugin.constructor.version < 5
        );
    }

    getOutputFilename(
        buildOptions,
        filehash,
        compilation
    ) {
        const filename = buildOptions.filename;

        if (/\[hash\]/.test(buildOptions.filename)) {
            return filename.replace(/\[hash\]/, compilation.hash);
            // filename = filename.replace(/\[hash\]/, '');
        } else if (/\[chunkhash\]/.test(buildOptions.filename)) {
            return filename.replace(/\[chunkhash\]/, fileHash);
        } else {
            return filename;
        }
    }

    apply(compiler) {
        const hooks = compiler.hooks;

        hooks.make.tapPromise('ModernizrWebpackPlugin', (compilation) => {
            const buildOptions = Object.assign({}, this.options);

            return new Promise((resolve) => {
                build(buildOptions, (output) => {
                    if (buildOptions.minify) {
                        output = this.minifySource(output, buildOptions.minify);
                    }

                    const outputHash = this.createHash(
                        output,
                        compiler.options.output.hashDigestLength
                    );
                    const rawModernizrSource = new webpack.sources.RawSource(
                        output,
                        true
                    );

                    let plugins = [],
                        plugin = buildOptions.htmlWebpackPlugin;
                    const filterFunct = (plugin, error) => {
                        if (this.validatePlugin(plugin)) {
                        return true;
                        }
                        if (typeof error === 'boolean' && error) {
                        compilation.errors.push(new Error('Unable to inject into html-webpack-plugin instance.\n' +
                            'Please log issue at https://github.com/alexpalombaro/modernizr-webpack-plugin/issues.'));
                        }
                    };
                    switch (typeof plugin) {
                        case 'array':
                        plugins = plugin.filter((plugin) => {
                            return filterFunct(plugin, true);
                        });
                        break;
                        case 'object':
                        if (filterFunct(plugin, true)) {
                            plugins.push(plugin);
                        }
                        break;
                        case 'boolean':
                        plugins = plugin ? compiler.options.plugins.filter(filterFunct) : [];
                        break;
                    }
                    plugins.forEach((plugin) => {
                        this.htmlWebpackPluginAddHtmlAsset(
                            plugin,
                            buildOptions,
                            compilation,
                            outputHash,
                            rawModernizrSource
                        );

                        this.htmlWebpackPluginInjectScriptTag(
                            plugin,
                            buildOptions,
                            compilation,
                            outputHash
                        );
                    });
                    resolve();
                });
            });
        });

    }
}

module.exports = ModernizrPlugin;
