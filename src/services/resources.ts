import * as PIXI from 'pixi.js';
import { ComponentDescAny, COMPONENT_TYPE } from 'game/services/scene';


export const COMPONENT_ASSETS = {
    COMPONENT_LEADERBOARD: 'leaderboard.json',
};

export const enum SPRITE_ASSETS {
    WINDOW_BACK = 'info_plate_big'
}

export default class Resources {
    private loader: PIXI.Loader;

    public async init(): Promise<void> {
        this.loader = PIXI.Loader.shared;

        for (const name in COMPONENT_ASSETS) {
            this.loader.add(COMPONENT_ASSETS[name]);
        }

        // load components
        await new Promise<void>(resolve => this.loader.load(() => resolve()));

        // load sprites from components, we need to load them explicit, to calculate
        // bounds on window creation
        this.collectWindowsAssets();

        // load sprites
        await new Promise<void>(resolve => this.loader.load(() => resolve()));
    }

    public get<T = never>(name: string): T {
        return PIXI.Loader.shared.resources[name]?.data;
    }

    private collectWindowsAssets() {
        for (const name in COMPONENT_ASSETS) {
            this.collectAssets(this.get<ComponentDescAny>(COMPONENT_ASSETS[name]));
        }
    }

    private collectAssets(desc: ComponentDescAny) {
        switch (desc.type) {
            case COMPONENT_TYPE.CONTAINER:
                for (const ch of desc.children || []) {
                    this.collectAssets(ch);
                }
                break;

            case COMPONENT_TYPE.SPRITE:
                this.loader.add(desc.key);
                break;
        }
    }
}

export const resources = new Resources();