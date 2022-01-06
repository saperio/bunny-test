import * as PIXI from 'pixi.js';
import WindowBase, { BaseView } from 'game/windows/window';


export interface EndView extends BaseView {
    scoreText: PIXI.Text;
    coinText: PIXI.Text;
    distanceText: PIXI.Text;
    rays: PIXI.Sprite;
    stars: PIXI.Container;
}

export default class End extends WindowBase<EndView> {
    private readonly raysVelocity = 20; // deg/sec
    private readonly starsVelocity = 10; // deg/sec
    private readonly starsPeriod = 2200; // msec
    private time: number;
    private active: boolean;
    private timeAccum: number;
    private starDirection: number;
    private starsVelocityFactor: number[];

    public show() {
        super.show();

        this.view.scoreText.text = Math.floor(Math.random() * 1000).toString();
        this.view.coinText.text = Math.floor(Math.random() * 100).toString();
        this.view.distanceText.text = `${Math.floor(Math.random() * 400)} м`;
        this.updateAlign();

        this.starsVelocityFactor = this.view.stars.children.map(() => 0.3 + Math.random() * 1.4);
        for (const star of this.view.stars.children) {
            star.angle = Math.random() * 180;
        }

        this.active = true;
        this.time = -1;
        this.timeAccum = this.starsPeriod / 2;
        this.starDirection = 1;
        window.requestAnimationFrame(this.animFrame);
    }

    public hide() {
        super.hide();

        this.active = false;
    }

    private animFrame = (timestamp: number) => {
        if (!this.active) {
            return;
        }

        if (this.time === -1) {
            this.time = timestamp;
        }

        const dt = timestamp - this.time;
        this.time = timestamp;

        this.timeAccum += dt;
        if (this.timeAccum > this.starsPeriod) {
            this.timeAccum = 0;
            this.starDirection *= -1;
        }

        this.view.rays.angle += this.raysVelocity * dt / 1000;
        for (let i = this.starsVelocityFactor.length - 1; i >= 0; --i) {
            const star = this.view.stars.children[i];
            const velocityFactor = this.starsVelocityFactor[i];

            star.angle += velocityFactor * this.starsVelocity * this.starDirection * dt / 1000;
        }

        window.requestAnimationFrame(this.animFrame);
    };
}