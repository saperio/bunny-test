import * as PIXI from 'pixi.js';
import { ComponentDescAny, COMPONENT_TYPE } from 'game/services/scene';
import { COMPONENT_ASSETS } from 'game/constants';


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
        let assetList: string[] = [];
        for (const name in COMPONENT_ASSETS) {
            assetList.push(
                ...this.collectAssets(this.get<ComponentDescAny>(COMPONENT_ASSETS[name]))
            );
        }

        assetList = assetList.filter((asset, idx) => assetList.indexOf(asset) === idx);
        for (const asset of assetList) {
            this.loader.add(asset);
        }
    }

    private collectAssets(desc: ComponentDescAny): string[] {
        const assetList: string[] = [];
        switch (desc.type) {
            case COMPONENT_TYPE.CONTAINER:
                for (const ch of desc.children || []) {
                    assetList.push(...this.collectAssets(ch));
                }
                break;

            case COMPONENT_TYPE.SPRITE:
                assetList.push(desc.key);
                break;

            case COMPONENT_TYPE.BTN:
                assetList.push(desc.up);
                assetList.push(desc.hover);
                assetList.push(desc.down);
                break;
        }

        return assetList;
    }
}

export const resources = new Resources();