import * as PIXI from 'pixi.js';
import { scene, ContainerComponentDesc, COMPONENT_TYPE } from 'game/services/scene';


export interface WindowDesc {
    parent: PIXI.Container;
    componentDesc: ContainerComponentDesc;
}

export interface WindowBaseView {
    root: PIXI.Container;
}

export default abstract class WindowBase<View extends WindowBaseView> {
    protected readonly view: View;
    private readonly componentDesc: ContainerComponentDesc;

    constructor(desc: WindowDesc) {
        const { parent, componentDesc } = desc;

        this.componentDesc = componentDesc;
        this.view = scene.make<View>(parent, componentDesc);

        const { root } = this.view;
        const { width, height } = root.getLocalBounds();
        root.x = Math.floor((scene.width - width) / 2);
        root.y = Math.floor((scene.height - height) / 2);

        this.updateAlign();
    }

    public show() {
        this.view.root.visible = true;
    }

    public hide() {
        this.view.root.visible = false;
    }

    protected updateAlign() {
        this.updateAlignContainer(this.view.root, this.componentDesc);
    }

    // recursive update text align
    private updateAlignContainer(container: PIXI.Container, desc: ContainerComponentDesc) {
        const { width } = container.getLocalBounds();
        const { children } = desc;
        for (let i = children.length - 1; i >= 0; --i) {
            const childDesc = children[i];
            const child = container.children[i];

            if (childDesc.type === COMPONENT_TYPE.TEXT) {
                const { align = 'none', padding = 0 } = childDesc;

                if (align === 'center') {
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