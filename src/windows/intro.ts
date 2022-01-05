import * as PIXI from 'pixi.js';
import WindowBase, { WindowBaseView } from 'game/windows/window';


export interface LeaderbordView extends WindowBaseView {
    record: PIXI.Text;
}

export default class Leaderbord extends WindowBase<LeaderbordView> {
    public show() {
        super.show();

        this.view.record.text = Math.floor(Math.random() * 1000).toString();
        this.updateAlign();
    }
}