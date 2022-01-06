import * as PIXI from 'pixi.js';
import WindowBase, { BaseView } from 'game/windows/window';
import { ContainerComponentDesc, scene } from 'game/services/scene';
import { resources } from 'game/services/resources';
import Btn from 'game/ui/btn';
import { COMPONENT_ASSETS } from 'game/constants';
import { leaders_all, leaders_month, leaders_week } from 'game/mock';
import FSM from 'game/common/fsm';
import { CancelableSequence, wait } from 'game/common/utils';
import Signal from 'game/common/signal';


interface LeaderbordView extends BaseView {
    sectionText: PIXI.Text;
    loadingText: PIXI.Text;
    leftBtn: Btn;
    rightBtn: Btn;
    list: PIXI.Container;
    okBtn: Btn;
}

interface ItemView extends BaseView {
    placeText?: PIXI.Text;
    nameText: PIXI.Text;
    scoreText: PIXI.Text;
}

interface LeaderData {
    name: string;
    score: number;
}

const enum SIGNALS {
    LEFT = 'left',
    RIGHT = 'right',
    SHOW = 'show',
    HIDE = 'hide'
}

export default class Leaderbord extends WindowBase<LeaderbordView> {
    private readonly itemViews: ItemView[];
    private readonly itemComponentDescs: ContainerComponentDesc[];
    private readonly fsm: FSM;
    private seq: CancelableSequence;

    constructor(parent: PIXI.Container) {
        super(
            parent,
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_LEADERBOARD)
        );

        this.defaultBtn = this.view.okBtn;
        this.itemViews = [];
        this.itemComponentDescs = [];

        this.createItems();

        const { leftBtn, rightBtn } = this.view;
        leftBtn.pressSignal.on(() => this.fsm.event(SIGNALS.LEFT));
        rightBtn.pressSignal.on(() => this.fsm.event(SIGNALS.RIGHT));

        this.fsm = new FSM({
            initial: 'off',
            states: {
                off: {
                    transitions: {
                        [SIGNALS.SHOW]: 'all'
                    }
                },
                all: {
                    enter: () => {
                        this.startLeadersRoll('Все время', leaders_all);
                    },
                    exit: () => this.stopLeadersRoll(),
                    transitions: {
                        [SIGNALS.LEFT]: 'week',
                        [SIGNALS.RIGHT]: 'month',
                        [SIGNALS.HIDE]: 'off'
                    }
                },
                month: {
                    enter: () => {
                        this.startLeadersRoll('Месяц', leaders_month);
                    },
                    exit: () => this.stopLeadersRoll(),
                    transitions: {
                        [SIGNALS.LEFT]: 'all',
                        [SIGNALS.RIGHT]: 'week',
                        [SIGNALS.HIDE]: 'off'
                    }
                },
                week: {
                    enter: () => {
                        this.startLeadersRoll('Неделя', leaders_week);
                    },
                    exit: () => this.stopLeadersRoll(),
                    transitions: {
                        [SIGNALS.LEFT]: 'month',
                        [SIGNALS.RIGHT]: 'all',
                        [SIGNALS.HIDE]: 'off'
                    }
                }
            }
        });
    }

    public show() {
        super.show();
        this.fsm.event(SIGNALS.SHOW);
    }

    public hide() {
        super.hide();
        this.fsm.event(SIGNALS.HIDE);
    }

    public get okSignal(): Signal {
        return this.view.okBtn.pressSignal;
    }

    protected updateAlign() {
        super.updateAlign();

        if (!this.itemViews) {
            return;
        }

        for (let i = 0; i < this.itemViews.length; ++i) {
            this.updateAlignContainer(this.itemViews[i].root, this.itemComponentDescs[i]);
        }
    }

    private createItems() {
        this.itemComponentDescs.push(
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_ITEM_FIRST),
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_ITEM_SECOND),
            resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_ITEM_THIRD),
        );

        const tailItemComponentDesc = resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_ITEM_TAIL);
        for (let i = 0; i < 7; ++i) {
            this.itemComponentDescs.push(tailItemComponentDesc);
        }

        let offset = 0;
        const interval = 3;
        for (let i = 0; i < this.itemComponentDescs.length; ++i) {
            const desc = this.itemComponentDescs[i];
            const view = scene.make<ItemView>(this.view.list, desc);
            const { placeText } = view;

            if (placeText) {
                placeText.text = (i + 1).toString();
            }

            view.root.y += offset;
            offset += view.root.getLocalBounds().height + interval;

            this.itemViews.push(view);
        }
    }

    private startLeadersRoll(section: string, list: LeaderData[]) {
        this.view.sectionText.text = section;

        for (const view of this.itemViews) {
            view.root.visible = false;
        }

        this.seq = new CancelableSequence(
            async () => {
                this.view.loadingText.visible = true;
                await wait(150);
                this.view.loadingText.visible = false;
            },
            ...this.itemViews.map((view, idx) => async () => {
                view.root.visible = true;
                view.nameText.text = list[idx].name;
                view.scoreText.text = list[idx].score.toString();
                this.updateAlign();

                await wait(100);
            })
        );
    }

    private stopLeadersRoll() {
        this.seq.cancel();
    }
}