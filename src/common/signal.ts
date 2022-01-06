export default class Signal {
    private readonly et = new EventTarget();

    public on(cb: () => void) {
        const wraper = (evt: CustomEvent) => cb();
        this.et.addEventListener('e', wraper);
    }

    public dispatch() {
        this.et.dispatchEvent(new CustomEvent('e'));
    }
}