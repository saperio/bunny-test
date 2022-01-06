import * as PIXI from 'pixi.js';
import WindowBase, { BaseView } from 'game/windows/window';


export interface IntroView extends BaseView {
    record: PIXI.Text;
}

export default class Intro extends WindowBase<IntroView> {
    public show() {
        super.show();

        this.view.record.text = Math.floor(Math.random() * 1000).toString();
        this.updateAlign();
    }
}