import { scene } from 'game/services/scene';
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

async function run() {
    scene.init();
    await resources.init();

    const game = new Game(scene.root);
    game.pauseSignal.on(() => fsm.event(SIGNALS.GAME_PAUSE));

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
                },
                exit: () => {
                    intro.hide();
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
                },
                exit: () => {
                    leaderboard.hide();
                },
                transitions: {
                    [SIGNALS.OK]: 'init',
                }
            },
            play: {
                enter: () => {
                    game.pause(false);
                    setTimeout(() => fsm.event(SIGNALS.GAME_END), 1000);
                },
                exit: () => {
                    game.pause(true);
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
                },
                exit: () => {
                    end.hide();
                },
                transitions: {
                    [SIGNALS.OK]: 'leaderboard'
                }
            },
        }
    });

}