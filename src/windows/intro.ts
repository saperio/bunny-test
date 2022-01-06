import * as PIXI from 'pixi.js';
import WindowBase, { BaseView } from 'game/windows/window';
import { resources } from 'game/services/resources';
import { COMPONENT_ASSETS } from 'game/constants';
import { ContainerComponentDesc } from 'game/services/scene';
import Signal from 'game/common/signal';
import Btn from 'game/ui/btn';


export interface IntroView extends BaseView {
    record: PIXI.Text;
    leaderboardBtn: Btn;
    playBtn: Btn;
}

export default class Intro extends WindowBase<IntroView> {
    constructor(parent: PIXI.Container) {
        super(
            parent,
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_INTRO)
        );
    }

    public show() {
        super.show();

        this.view.record.text = Math.floor(Math.random() * 1000).toString();
        this.updateAlign();
    }

    public get playSignal(): Signal {
        return this.view.playBtn.pressSignal;
    }

    public get leaderboardSignal(): Signal {
        return this.view.leaderboardBtn.pressSignal;
    }
}