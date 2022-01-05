import * as PIXI from 'pixi.js';
import { scene, ComponentDescAny } from 'game/services/scene';


export interface WindowDesc {
    parent: PIXI.Container;
    title: string;
    componentDesc: ComponentDescAny;
}

export interface WindowInstanceMap {
    title: PIXI.Text;
    root: PIXI.Container;
}

export default abstract class WindowBase {
    public readonly container: PIXI.Container;

    constructor(desc: WindowDesc) {
        const { parent, title, componentDesc } = desc;
        const { title: titleText, root } = scene.make<WindowInstanceMap>(parent, componentDesc);

        if (titleText) {
            titleText.text = title;
        }

        this.container = root;

        const { width, height } = root.getLocalBounds();
        root.x = Math.floor((scene.width - width) / 2);
        root.y = Math.floor((scene.height - height) / 2);
    }

    public show() {
        this.container.visible = true;
    }

    public hide() {
        this.container.visible = false;
    }
}