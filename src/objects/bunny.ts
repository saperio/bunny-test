import * as PIXI from 'pixi.js';
import { GAME_ASSETS } from 'game/constants';
import FSM from 'game/common/fsm';


function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}

const enum SIGNALS {
    JUMP = 'jump',
    JUMP_NEXT = 'jump_wait'
}

export default class Bunny {
    public readonly container: PIXI.Container;
    private readonly jumpHeight = 390; // px
    private readonly jumpStartTime = 350; // msec
    private readonly jumpWaitTime = 100; // msec
    private readonly jumpDownTime = 320; // msec
    private readonly jumpFallVelocity = 4500; // px/sec
    private readonly bunny: PIXI.Sprite;
    private readonly slope: number;
    private fsm: FSM;
    private updaterCurrent: (dt: number) => void;
    private phaseTime: number;

    constructor(parent: PIXI.Container, slope: number) {
        this.container = new PIXI.Container();
        this.slope = slope;

        this.bunny = PIXI.Sprite.from(GAME_ASSETS.BUNNY);
        this.bunny.anchor.y = 0.85;

        this.container.addChild(this.bunny);
        parent.addChild(this.container);

        this.createFsm();
    }

    public jump() {
        this.fsm.event(SIGNALS.JUMP);
    }

    public reset() {
        this.createFsm();
    }

    public update(dt: number) {
        this.updaterCurrent?.(dt);
    }

    private createFsm() {
        this.fsm = new FSM({
            initial: 'idle',
            states: {
                idle: {
                    enter: () => {
                        this.updaterCurrent = null;
                        this.bunny.angle = this.slope;
                        this.bunny.y = 0;
                    },
                    exit: () => this.bunny.angle = 0,
                    transitions: {
                        [SIGNALS.JUMP]: 'jumpStart'
                    }
                },
                jumpStart: {
                    enter: () => {
                        this.updaterCurrent = this.updateJumpStart;
                        this.phaseTime = 0;
                    },
                    transitions: {
                        [SIGNALS.JUMP_NEXT]: 'jumpWait',
                        [SIGNALS.JUMP]: 'jumpFall'
                    }
                },
                jumpWait: {
                    enter: () => {
                        this.updaterCurrent = this.updateJumpWait;
                        this.phaseTime = 0;
                    },
                    transitions: {
                        [SIGNALS.JUMP_NEXT]: 'jumpDown',
                        [SIGNALS.JUMP]: 'jumpFall'
                    }
                },
                jumpDown: {
                    enter: () => {
                        this.updaterCurrent = this.updateJumpDown;
                        this.phaseTime = 0;
                    },
                    transitions: {
                        [SIGNALS.JUMP_NEXT]: 'idle',
                        [SIGNALS.JUMP]: 'jumpFall'
                    }
                },
                jumpFall: {
                    enter: () => {
                        this.updaterCurrent = this.updateJumpFall;
                        this.phaseTime = 0;
                    },
                    transitions: {
                        [SIGNALS.JUMP_NEXT]: 'idle'
                    }
                }
            }
        });
    }

    private updateJumpStart = (dt: number) => {
        this.phaseTime += dt;
        if (this.phaseTime >= this.jumpStartTime) {
            this.fsm.event(SIGNALS.JUMP_NEXT);
            return;
        }

        const factor = easeOutQuart(this.phaseTime / this.jumpStartTime);
        this.bunny.y = -this.jumpHeight * factor;
    };

    private updateJumpWait = (dt: number) => {
        this.phaseTime += dt;
        if (this.phaseTime >= this.jumpWaitTime) {
            this.fsm.event(SIGNALS.JUMP_NEXT);
        }
    };

    private updateJumpDown = (dt: number) => {
        this.phaseTime += dt;
        if (this.phaseTime >= this.jumpDownTime) {
            this.fsm.event(SIGNALS.JUMP_NEXT);
            return;
        }

        const factor = easeOutQuart(1 - this.phaseTime / this.jumpDownTime);
        this.bunny.y = -this.jumpHeight * factor;
    };

    private updateJumpFall = (dt: number) => {
        this.phaseTime += dt;
        this.bunny.y += this.jumpFallVelocity * dt / 1000;

        if (this.bunny.y >= 0) {
            this.fsm.event(SIGNALS.JUMP_NEXT);
        }
    };
}