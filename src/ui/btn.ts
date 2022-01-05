import * as PIXI from 'pixi.js';
import Signal from 'game/common/signal';


export default class Btn extends PIXI.Sprite {
    public readonly pressSignal: Signal;
    private readonly up: PIXI.Texture;
    private readonly hover: PIXI.Texture;
    private readonly down: PIXI.Texture;
    private pressed: boolean;

    constructor(up: PIXI.Texture, hover: PIXI.Texture, down: PIXI.Texture) {
        super(up);

        this.up = up;
        this.hover = hover;
        this.down = down;
        this.pressed = false;
        this.pressSignal = new Signal();

        this.interactive = true;
        this.buttonMode = true;

        this
            .on('pointerdown', this.onPointerDown)
            .on('pointerup', this.onPointerUp)
            .on('pointerupoutside', this.onPointerUpOtside)
            .on('pointerover', this.onPointerHover)
            .on('pointerout', this.onPointerOut);
    }

    private onPointerUp = () => {
        this.texture = this.up;
        this.pressed = false;
        this.pressSignal.dispatch();
    };

    private onPointerUpOtside = () => {
        this.texture = this.up;
        this.pressed = false;
    };

    private onPointerHover = () => {
        this.texture = this.hover;
    };

    private onPointerDown = () => {
        this.texture = this.down;
        this.pressed = true;
    };

    private onPointerOut = () => {
        if (!this.pressed) {
            this.texture = this.up;
        }
    };
}