import { ContainerComponentDesc, scene } from 'game/services/scene';
import { resources } from 'game/services/resources';
import Leaderbord from 'game/windows/leaderboard';
import Intro from 'game/windows/intro';
import End from 'game/windows/end';


run();

async function run() {
    scene.init();
    await resources.init();

    // const intro = new Intro({
    //     parent: scene.root,
    //     componentDesc: resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_INTRO)
    // });
    // intro.show();

    const leaderbord = new Leaderbord(scene.root);
    leaderbord.show();

    // const end = new End({
    //     parent: scene.root,
    //     componentDesc: resources.get<ContainerComponentDesc>(COMPONENT_ASSETS.COMPONENT_END)
    // });
    // end.show();
}