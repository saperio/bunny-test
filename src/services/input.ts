import Signal from 'game/common/signal';

export default class Input {
    public readonly defaultActionDownSignal: Signal;
    public readonly defaultActionUpSignal: Signal;

    constructor() {
        this.defaultActionDownSignal = new Signal();
        this.defaultActionUpSignal = new Signal();

        window.addEventListener('keydown', event => {
            if (event.code === 'Space') {
                this.defaultActionDownSignal.dispatch();
            }
        });

        window.addEventListener('keyup', event => {
            if (event.code === 'Space') {
                this.defaultActionUpSignal.dispatch();
            }
        });
    }
}

export const input = new Input();