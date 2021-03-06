export type Loggable = {
    on: (key: string, ...args: any[]) => void;
}

export type GetStateFn = () => any[];
export type Config = {
    id?: number;
    addTime?: boolean;
    className: string;
    logger?: (...args: any[]) => void;
};

let globalEnable = true;

function stringify(item: any): string {
    if (item && item.toObj) {
        item = item.toObj();
    }

    if (item && typeof item === "object") {
        return JSON.stringify(item);
    }

    return String(item);
}

function createStringGroup(args: any[]): string {
    return `${args.length}:${args.reduce((acc, item) => {
        const str = stringify(item);
        acc.push(str.length);
        acc.push(":");
        acc.push(str);
        return acc;
    }, []).join("")}`;
}

let id = 0;
export function getNewId(): number {
    return ++id;
}

export function setEnabledGlobally(enabled: boolean) {
    globalEnable = enabled;
}

export class Logger {
    constructor(private state: GetStateFn, private config: Config) {
        if (!this.config.id) {
            this.config.id = getNewId();
        }

        if (this.config.addTime === undefined) {
            this.config.addTime = true;
        }

        if (this.config.logger === undefined) {
            this.config.logger = console.log;
        }
    }

    child(state: GetStateFn, className: string) {
        return new Logger(state, {
            className: `${this.config.className}:${this.config.id}:${className}`
        });
    }

    info(functionName: string, ...args: any[]) {
        if (!globalEnable) {
            return;
        }

        const state: any[] = this.state();

        this.config.logger(
            Date.now(),
            this.config.id, this.config.className, functionName,
            createStringGroup(state),
            createStringGroup(args));
    }
}

