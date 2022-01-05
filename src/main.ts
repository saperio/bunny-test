import { ComponentDescAny, scene } from 'game/services/scene';
import { resources, COMPONENT_ASSETS } from 'game/services/resources';
import Leaderbord from 'game/windows/leaderboard';


run();

async function run() {
    scene.init();

    await resources.init();

    const desc = resources.get<ComponentDescAny>(COMPONENT_ASSETS.COMPONENT_LEADERBOARD);

    new Leaderbord({
        title: 'привет',
        parent: scene.root,
        componentDesc: desc
    });
}