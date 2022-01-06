import * as PIXI from 'pixi.js';
import { scene, ContainerComponentDesc, COMPONENT_TYPE } from 'game/services/scene';
import Btn from 'game/ui/btn';


export interface BaseView {
    root: PIXI.Container;
}

export default abstract class WindowBase<View extends BaseView> {
    protected readonly view: View;
    protected defaultBtn: Btn;
    private readonly componentDesc: ContainerComponentDesc;

    constructor(parent: PIXI.Container, componentDesc: ContainerComponentDesc) {
        this.componentDesc = componentDesc;
        this.view = scene.make<View>(parent, componentDesc);

        const { root } = this.view;
        const { x, y, width, height } = root.getLocalBounds();
        root.x = Math.floor((scene.width - width) / 2) - x;
        root.y = Math.floor((scene.height - height) / 2) - y;

        this.updateAlign();
    }

    public show() {
        this.view.root.visible = true;
    }

    public hide() {
        this.view.root.visible = false;
    }

    public defaultActionDown() {
        this.defaultBtn?.forceDown();
    }

    public defaultActionUp() {
        this.defaultBtn?.forceUp();
    }

    protected updateAlign() {
        this.updateAlignContainer(this.view.root, this.componentDesc);
    }

    // recursive update text align
    protected updateAlignContainer(container: PIXI.Container, desc: ContainerComponentDesc) {
        const { children = [] } = desc;
        for (let i = 0; i < children.length; ++i) {
            const childDesc = children[i];
            const child = container.children[i];

            if (childDesc.type === COMPONENT_TYPE.TEXT) {
                const { align = 'none', padding = 0 } = childDesc;

                if (align === 'center') {
                    const textObj = child as PIXI.Text;
                    const { text } = textObj;

                    // Little hack: we need merged bounds of all objects of container exept texts,
                    // but use only one text per container, so we can for simplicity remove text,
                    // get bounds and set back text
                    textObj.text = '';
                    const { width } = container.getLocalBounds();
                    textObj.text = text;

                    child.x = padding + Math.floor((width - child.getLocalBounds().width) / 2);
                } else if (align === 'left') {
                    child.x = padding;
                }
            } else if (childDesc.type === COMPONENT_TYPE.CONTAINER) {
                this.updateAlignContainer(child as PIXI.Container, childDesc);
            }
        }
    }
}