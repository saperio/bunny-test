import * as PIXI from 'pixi.js';


export const enum COMPONENT_TYPE {
    CONTAINER = 'container',
    SPRITE = 'sprite',
    TEXT = 'text'
}

interface ComponentDesc {
    type: COMPONENT_TYPE;
    instance?: string;
    x?: number;
    y?: number;
}

interface ContainerComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.CONTAINER;
    children?: ComponentDescAny[];
}

interface SpriteComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.SPRITE;
    key: string;
}

interface TextComponentDesc extends ComponentDesc {
    type: COMPONENT_TYPE.TEXT;
    color?: string;
    size?: number;
}

export type ComponentDescAny = ContainerComponentDesc | SpriteComponentDesc | TextComponentDesc;


export default class Scene {
    public readonly width = 1280;
    public readonly height = 1000;
    private app: PIXI.Application;

    public init() {
        this.app = new PIXI.Application({
            width: this.width,
            height: this.height,
            // autoStart: false,
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
        const { type, instance, x = 0, y = 0 } = desc;
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
        }

        if (!obj) {
            return;
        }

        obj.x = x;
        obj.y = y;
        parent.addChild(obj);

        if (instance) {
            view[instance] = obj;
        }
    }

    private makeContainerComponent<InstanceMap>(
        desc: ContainerComponentDesc,
        view: InstanceMap
    ): PIXI.Container {
        const { children = [] } = desc;
        const container = new PIXI.Container();

        for (const childDesc of children) {
            this.makeComponent(container, childDesc, view);
        }

        return container;
    }

    private makeSpriteComponent(desc: SpriteComponentDesc): PIXI.Container {
        const { key } = desc;

        return PIXI.Sprite.from(key);
    }

    private makeTextComponent(desc: TextComponentDesc): PIXI.Container {
        const { color = '#ffffff', size = 30 } = desc;
        const style = new PIXI.TextStyle({
            fontSize: size,
            fill: color,
            fontFamily: 'BunnyFont'
        });

        return new PIXI.Text(null, style);
    }
}

export const scene = new Scene();