export interface FSMState {
    enter?: () => void;
    exit?: () => void;
    transitions?: {
        [state: string]: string;
    };
}

export interface FSMConfig {
    states: {
        [state: string]: FSMState;
    };
    initial: string;
}

export default class FSM {
    private readonly states: { [state: string]: FSMState  };
    private currentState: FSMState;

    constructor(config: FSMConfig) {
        this.states = config.states;

        const initialState = this.states[config.initial];
        if (initialState) {
            this.currentState = initialState;
            initialState.enter?.();
        }
    }

    public event(eventName: string) {
        const nextStateName = this.currentState?.transitions?.[eventName];
        const nextState = this.states[nextStateName];

        if (!nextState) {
            return;
        }

        this.currentState.exit?.();
        this.currentState = nextState;
        this.currentState.enter?.();
    }
}