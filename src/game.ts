import * as PIXI from 'pixi.js';
import { ContainerComponentDesc, scene } from 'game/services/scene';
import { resources } from 'game/services/resources';
import { COMPONENT_ASSETS } from 'game/constants';
import Btn from 'game/ui/btn';
import Signal from './common/signal';


interface HudView  {
    onSoundBtn: Btn;
    offSoundBtn: Btn;
    pauseBtn: Btn;
}

export default class Game {
    private pauseBtn: Btn;
    constructor(parent: PIXI.Container) {
        this.createGame(parent);
        this.createHud(parent);

        this.pause(true);
    }

    public pause(is: boolean) {

    }

    public get pauseSignal(): Signal {
        return this.pauseBtn.pressSignal;
    }

    private createGame(parent: PIXI.Container) {
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
}