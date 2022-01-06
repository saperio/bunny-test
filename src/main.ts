import { scene } from 'game/services/scene';
import { input } from 'game/services/input';
import { resources } from 'game/services/resources';
import Leaderboard from 'game/windows/leaderboard';
import Intro from 'game/windows/intro';
import End from 'game/windows/end';
import Game from 'game/game';
import FSM from 'game/common/fsm';


run();

const enum SIGNALS {
    PLAY = 'play',
    LEADERBOARD = 'leaderboard',
    OK = 'ok',
    GAME_END = 'end',
    GAME_PAUSE = 'pause'
}

interface DefaultActionConsumer {
    defaultActionDown: () => void;
    defaultActionUp?: () => void;
}

async function run() {
    scene.init();
    await resources.init();

    const game = new Game(scene.root);
    game.pauseSignal.on(() => fsm.event(SIGNALS.GAME_PAUSE));
    game.endGameSignal.on(() => fsm.event(SIGNALS.GAME_END));

    let defaultActionConsumer: DefaultActionConsumer;
    input.defaultActionDownSignal.on(() => defaultActionConsumer?.defaultActionDown());
    input.defaultActionUpSignal.on(() => defaultActionConsumer?.defaultActionUp?.());

    let intro: Intro;
    const initIntro = () => {
        if (intro) {
            return;
        }

        intro = new Intro(scene.root);
        intro.playSignal.on(() => fsm.event(SIGNALS.PLAY));
        intro.leaderboardSignal.on(() => fsm.event(SIGNALS.LEADERBOARD));
    };

    let leaderboard: Leaderboard;
    const initLeaderboard = () => {
        if (leaderboard) {
            return;
        }

        leaderboard = new Leaderboard(scene.root);
        leaderboard.okSignal.on(() => fsm.event(SIGNALS.OK));
    };

    let end: End;
    const initEnd = () => {
        if (end) {
            return;
        }

        end = new End(scene.root);
        end.okSignal.on(() => fsm.event(SIGNALS.OK));
    };

    const fsm = new FSM({
        initial: 'init',
        states: {
            init: {
                enter: () => {
                    initIntro();
                    intro.show();
                    defaultActionConsumer = intro;
                },
                exit: () => {
                    intro.hide();
                    defaultActionConsumer = null;
                },
                transitions: {
                    [SIGNALS.PLAY]: 'play',
                    [SIGNALS.LEADERBOARD]: 'leaderboard'
                }
            },
            leaderboard: {
                enter: () => {
                    initLeaderboard();
                    leaderboard.show();
                    defaultActionConsumer = leaderboard;
                },
                exit: () => {
                    leaderboard.hide();
                    defaultActionConsumer = null;
                },
                transitions: {
                    [SIGNALS.OK]: 'init',
                }
            },
            play: {
                enter: () => {
                    game.pause(false);
                    defaultActionConsumer = game;
                },
                exit: () => {
                    game.pause(true);
                    defaultActionConsumer = null;
                },
                transitions: {
                    [SIGNALS.GAME_END]: 'end',
                    [SIGNALS.GAME_PAUSE]: 'pause',
                }
            },
            pause: {
                transitions: {
                    [SIGNALS.GAME_PAUSE]: 'play'
                }
            },
            end: {
                enter: () => {
                    initEnd();
                    end.show();
                    defaultActionConsumer = end;
                },
                exit: () => {
                    end.hide();
                    defaultActionConsumer = null;
                },
                transitions: {
                    [SIGNALS.OK]: 'leaderboard'
                }
            },
        }
    });
}