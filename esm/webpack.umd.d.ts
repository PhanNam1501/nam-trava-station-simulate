export const mode: string;
export const entry: string;
export const target: string;
export namespace output {
    const library: string;
    const libraryTarget: string;
    const path: string;
    const filename: string;
    const globalObject: string;
}
export namespace module {
    const rules: {
        test: RegExp;
        exclude: RegExp;
        use: {
            loader: string;
            options: {
                presets: (string | (string | {
                    targets: {
                        esmodules: boolean;
                    };
                })[])[];
            };
        };
    }[];
}
export const externals: string[];
export namespace resolve {
    const extensions: string[];
}
