import * as PIXI from 'pixi.js';
import Btn from 'game/ui/btn';

// to apply d.ts
import '@pixi/interaction';


export const enum COMPONENT_TYPE {
    CONTAINER = 'container',
    SPRITE = 'sprite',
    TEXT = 'text',
    BTN = 'btn'
}

export interface ComponentDesc {
    type: COMPONENT_TYPE;
    instance?: string;
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
}

export interface ContainerComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.CONTAINER;
    children?: ComponentDescAny[];
}

export interface SpriteComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.SPRITE;
    key: string;
    anchorX?: number;
    anchorY?: number;
}

export interface TextComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.TEXT;
    text?: string;
    color?: string;
    size?: number;
    align?: 'none' | 'left' | 'center';
    padding?: number;
}

export interface BtnComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.BTN;
    up: string;
    hover: string;
    down: string;
}

export type ComponentDescAny = ContainerComponentDesc | SpriteComponentDesc | TextComponentDesc | BtnComponentDesc;


export default class Scene {
    public readonly width = 1920;
    public readonly height = 1200;
    private app: PIXI.Application;

    public init() {
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            resolution: window.devicePixelRatio,
            powerPreference: 'high-performance',
            autoDensity: true
        });

        document.body.appendChild(this.app.view);

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    public make<InstanceMap = Record<string, PIXI.Container>>(parent: PIXI.Container, desc: ComponentDescAny): InstanceMap {
        const view = {} as InstanceMap;
        this.makeComponent(parent, desc, view);

        return view;
    }

    public get root(): PIXI.Container {
        return this.app.stage;
    }

    private resize() {
        const canvas = this.app.renderer.view;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';

        const ratio = Math.min(window.innerWidth / this.width, window.innerHeight / this.height);
        this.app.stage.scale.set(ratio, ratio);
        this.app.renderer.resize(Math.ceil(this.width * ratio), Math.ceil(this.height * ratio));
    }

    private makeComponent<InstanceMap>(parent: PIXI.Container, desc: ComponentDescAny, view: InstanceMap) {
        const {
            type,
            instance,
            x = 0,
            y = 0,
            scaleX = 1,
            scaleY = 1
        } = desc;
        let obj: PIXI.Container;

        switch (type) {
            case COMPONENT_TYPE.CONTAINER:
                obj = this.makeContainerComponent(desc, view);
                break;

            case COMPONENT_TYPE.SPRITE:
                obj = this.makeSpriteComponent(desc);
                break;

            case COMPONENT_TYPE.TEXT:
                obj = this.makeTextComponent(desc);
                break;

            case COMPONENT_TYPE.BTN:
                obj = this.makeBtnComponent(desc);
                break;
        }

        if (!obj) {
            return;
        }

        obj.x = x;
        obj.y = y;
        obj.scale.set(scaleX, scaleY);
        parent.addChild(obj);

        if (instance) {
            view[instance] = obj;
        }
    }

    private makeContainerComponent<InstanceMap>(desc: ContainerComponentDesc, view: InstanceMap): PIXI.Container {
        const { children = [] } = desc;
        const container = new PIXI.Container();

        for (const childDesc of children) {
            this.makeComponent(container, childDesc, view);
        }

        return container;
    }

    private makeSpriteComponent(desc: SpriteComponentDesc): PIXI.Container {
        const { key, anchorX = 0, anchorY = 0 } = desc;
        const sprite = PIXI.Sprite.from(key);

        sprite.anchor.set(anchorX, anchorY);

        return sprite;
    }

    private makeTextComponent(desc: TextComponentDesc): PIXI.Container {
        const { color = '#ffffff', size = 30, text = null } = desc;
        const style = new PIXI.TextStyle({
            fontSize: size,
            fill: color,
            fontFamily: 'BunnyFont'
        });

        return new PIXI.Text(text, style);
    }

    private makeBtnComponent(desc: BtnComponentDesc): Btn {
        const { up, hover, down } = desc;
        const btn = new Btn(
            PIXI.Texture.from(up),
            PIXI.Texture.from(hover),
            PIXI.Texture.from(down)
        );

        return btn;
    }
}

export const scene = new Scene();