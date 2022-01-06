export const wait = (time: number): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, time));

export class CancelableSequence {
    private list: (() => Promise<void>)[];

    constructor(...list: (() => Promise<void>)[]) {
        this.list = list;
        this.next();
    }

    public cancel() {
        this.list = [];
    }

    private async next(): Promise<void> {
        const gen = this.list.shift();
        if (!gen) {
            return;
        }

        await gen();

        this.next();
    }
}