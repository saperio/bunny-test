export default class Signal<Payload = void> {
    private readonly et = new EventTarget();

    public on(cb: (payload: Payload) => void) {
        const wraper = (evt: CustomEvent) => cb(evt.detail);
        this.et.addEventListener('e', wraper);
    }

    public dispatch(payload: Payload) {
        this.et.dispatchEvent(new CustomEvent('e', { detail: payload }));
    }
}