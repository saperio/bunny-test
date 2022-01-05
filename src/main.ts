import { ContainerComponentDesc, scene } from 'game/services/scene';
import { resources, COMPONENT_ASSETS } from 'game/services/resources';
import Leaderbord from 'game/windows/leaderboard';
import Intro from 'game/windows/intro';


run();

async function run() {
    scene.init();

    await resources.init();

    const desc = resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_INTRO);

    const intro = new Intro({
        parent: scene.root,
        componentDesc: desc
    });
    intro.show();

    Leaderbord;
}