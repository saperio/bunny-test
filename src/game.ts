import * as PIXI from 'pixi.js';
import { ContainerComponentDesc, scene } from 'game/services/scene';
import { resources } from 'game/services/resources';
import { COMPONENT_ASSETS, GAME_ASSETS } from 'game/constants';
import Btn from 'game/ui/btn';
import Signal from 'game/common/signal';
import Bunny from 'game/objects/bunny';


interface HudView  {
    onSoundBtn: Btn;
    offSoundBtn: Btn;
    pauseBtn: Btn;
}

export default class Game {
    public readonly endGameSignal: Signal;
    private readonly bunnyVelocity = 1000; // px/sec
    private readonly playTime = 8000; // msec
    private readonly slope = 3; // deg
    private pauseBtn: Btn;
    private ground: PIXI.TilingSprite;
    private rocks: PIXI.TilingSprite;
    private fader: PIXI.Sprite;
    private paused: boolean;
    private bunny: Bunny;
    private time: number;
    private playTimeCurrent: number;

    constructor(parent: PIXI.Container) {
        this.endGameSignal = new Signal();

        this.createBack(parent);
        this.createGame(parent);
        this.createHud(parent);

        this.pause(true);
    }

    public pause(is: boolean) {
        this.paused = is;
        this.fader.visible = is;

        if (!is) {
            this.time = -1;
            this.playTimeCurrent = 0;
            window.requestAnimationFrame(this.animFrame);
        }
    }

    public get pauseSignal(): Signal {
        return this.pauseBtn.pressSignal;
    }

    public defaultActionDown() {
        if (!this.paused) {
            this.bunny.jump();
        }
    }

    private createBack(parent: PIXI.Container) {
        const back = new PIXI.TilingSprite(
            PIXI.Texture.from(GAME_ASSETS.BACK),
            scene.width,
            scene.height
        );
        parent.addChild(back);

        const rocks = new PIXI.TilingSprite(
            PIXI.Texture.from(GAME_ASSETS.ROCS),
            scene.width,
            scene.height
        );
        rocks.y = 400;
        parent.addChild(rocks);
        this.rocks = rocks;

        const sun = PIXI.Sprite.from(GAME_ASSETS.SUN);
        sun.x = 100;
        sun.y = 150;
        sun.scale.set(0.8, 0.8);
        parent.addChild(sun);
    }

    private createGame(parent: PIXI.Container) {
        const gameContainer = new PIXI.Container();
        gameContainer.angle = this.slope;
        gameContainer.x = 50;
        parent.addChild(gameContainer);

        const groundHeight = 250;
        const ground = new PIXI.TilingSprite(
            PIXI.Texture.from(GAME_ASSETS.GROUND),
            scene.width + 50,
            groundHeight,
        );
        ground.y = scene.height - groundHeight;
        gameContainer.addChild(ground);
        this.ground = ground;

        this.bunny = new Bunny(parent, this.slope);
        this.bunny.container.x = 100;
        this.bunny.container.y = ground.y;

        const jumpBtn = PIXI.Sprite.from(PIXI.Texture.WHITE);
        jumpBtn.interactive = true;
        jumpBtn.alpha = 0;
        jumpBtn.width = scene.width;
        jumpBtn.height = scene.height;
        jumpBtn.on('pointerdown', () => this.defaultActionDown());
        parent.addChild(jumpBtn);

        const fader = PIXI.Sprite.from(PIXI.Texture.WHITE);
        fader.tint = 0;
        fader.alpha = 0.4;
        fader.width = scene.width;
        fader.height = scene.height;
        parent.addChild(fader);
        this.fader = fader;
    }

    private createHud(parent: PIXI.Container) {
        const { onSoundBtn, offSoundBtn, pauseBtn } = scene.make<HudView>(
            parent,
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.HUD)
        );

        onSoundBtn.pressSignal.on(() => {
            onSoundBtn.visible = false;
            offSoundBtn.visible = true;
        });

        offSoundBtn.pressSignal.on(() => {
            onSoundBtn.visible = true;
            offSoundBtn.visible = false;
        });

        offSoundBtn.pressSignal.dispatch();

        this.pauseBtn = pauseBtn;
    }

    private animFrame = (timestamp: number) => {
        if (this.paused) {
            return;
        }

        if (this.time === -1) {
            this.time = timestamp;
        }

        const dt = timestamp - this.time;
        this.time = timestamp;

        this.playTimeCurrent += dt;
        if (this.playTimeCurrent > this.playTime) {
            this.bunny.reset();
            this.endGameSignal.dispatch();
            return;
        }

        this.ground.tilePosition.x -= this.bunnyVelocity * dt / 1000;

        const paralaxFactor = 0.06;
        this.rocks.tilePosition.x -= paralaxFactor * this.bunnyVelocity * dt / 1000;

        this.bunny.update(dt);

        window.requestAnimationFrame(this.animFrame);
    };
}

