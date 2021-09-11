import fs from 'fs';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import { Compiler, compilation as compilationType, Stats } from 'webpack';

type Compilation = compilationType.Compilation;

export interface Options {
    /**
     * 要匹配文件的地址
     * default: ['/src/modules', '/src/components']
     */
    paths?: string[];

    /**
     * 要匹配的文件名
     * default: apis
     */
    filename?: string;

    /**
     * 输出文件的地址
     * default: /src/types
     */
    outputPath?: string;

    /**
     * 输出文件名
     * default: apis-keys.d.ts
     */
    outputFilename?: string;

    /**
     * 是否打印编译错误日志
     */
    verbose?: boolean;
}

function isPlainObject(value: unknown): boolean {
    if (Object.prototype.toString.call(value) !== '[object Object]')
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
}

class ExtractApisPlugin {
    private outputPath: string;
    private apisList: Set<string>;
    private readonly paths: string[];
    private readonly filename: string;
    private readonly outputFilename: string;
    private readonly verbose: boolean;

    constructor(options: Options) {
        if (options && isPlainObject(options) === false) {
            const packageJson = readPkgUp.sync()?.packageJson;
            const doc = packageJson?.repository?.url;
            throw new Error(`extract-apis-webpack-plugin only accepts an options object. See:
            ${doc}`);
        }

        this.paths = Array.isArray(options?.paths)
            ? options?.paths
            : ['/src/modules', '/src/components'];

        this.filename = options?.filename || 'apis';

        this.outputPath = options?.outputPath || '/src/types/';

        this.outputFilename = options?.outputFilename || 'apis-keys.d.ts';

        this.verbose = options?.verbose || false;

        this.apisList = new Set();
    }

    apply = (compiler: Compiler): void => {
        const context = compiler.context;

        if (!context) {
            console.warn(
                'extract-apis-webpack-plugin: compiler.context not defined. Plugin disabled...'
            );

            return;
        }

        const hooks = compiler.hooks;

        if (this.paths.length !== 0) {
            if (hooks) {
                hooks.emit.tap('extract-apis-webpack-plugin', (compilation) => {
                    this.handleInitial(compilation);
                });
            } else {
                compiler.plugin('emit', (compilation, callback) => {
                    try {
                        this.handleInitial(compilation);
                        callback();
                    } catch (error) {
                        callback(error);
                    }
                });
            }
        }

        if (hooks) {
            hooks.done.tap('extract-apis-webpack-plugin', (stats) => {
                this.handleDone(stats);
            });
        } else {
            compiler.plugin('done', (stats) => {
                this.handleDone(stats);
            });
        }

        // 输出的文件绝对路径+文件名
        this.outputPath = path.join(
            context,
            this.outputPath,
            this.outputFilename
        );

        return;
    };

    private handleInitial = async (compilation: Compilation): Promise<void> => {
        await this.handleTrunk(compilation.chunks);
        await this.handleOutPut();
        return;
    };

    private handleDone = (stats: Stats) => {
        if (stats.hasErrors()) {
            if (this.verbose) {
                console.warn(
                    'extract-apis-webpack-plugin: pausing due to webpack errors'
                );
            }

            return;
        }
    };

    private handleTrunk = async (chunks: any[]): Promise<void> => {
        this.apisList.clear();
        await chunks?.forEach(async (chunk) => {
            this.handleModules(await chunk.getModules());
        });
        return;
    };

    private handleModules = (modules: any) => {
        const reg = this.makeFilePatternReg();

        modules?.forEach((module: any) => {
            if (reg.test(module?.id)) {
                const content = module._source?._sourceMap?.sourcesContent?.[0];
                const apis = content?.match(/[\w-]+(?=\s*:\s*\{)/g);

                apis?.forEach((key: string) => {
                    this.apisList.add(key);
                });
            }
        });
    };

    private makeFilePatternReg = (): RegExp => {
        const context = this.paths
            .map((item) => `(${item.replace(/\//g, '\\/')})`)
            .join('|');
        const reg = new RegExp(
            `(${context})[\\w-\\/]*\\/${this.filename}\\.ts(x?)$`
        );
        return reg;
    };

    private handleOutPut = async (): Promise<void> => {
        const content = this.getDeclareContent();
        const same = await this.isSameFile(content);
        if (!same) await this.replaceFile(content);
        return;
    };

    private getDeclareContent = (): string => {
        const list: string[] = [];
        this.apisList.forEach((key) => list.push(key));
        return `declare const keys: [${list.map((key, index) =>
            index > 0 ? ` '${key}'` : `'${key}'`
        )}]`;
    };

    private isSameFile = async (content: string): Promise<boolean> => {
        try {
            const file = await fs.readFileSync(this.outputPath, {
                encoding: 'utf-8'
            });
            if (!isSameContent(content, file)) {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    private replaceFile = async (content: string): Promise<void> => {
        await fs.writeFileSync(this.outputPath, content);
        return;
    };
}

export { ExtractApisPlugin };

function isSameContent(content1: string, content2: string) {
    try {
        const file1 = clearSymbolString(content1);
        console.log('file1: ', file1);
        const file2 = clearSymbolString(content2);
        console.log('file2: ', file2);
        return file1 === file2;
    } catch (error) {
        console.error('error: ', error);
        return false;
    }
}

function clearSymbolString(content: string) {
    return content.replace(/[\r\n\s]/g, '').replace(/\\ +/g, '');
}
