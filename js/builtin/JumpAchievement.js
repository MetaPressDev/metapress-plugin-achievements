import Achievement from '../Achievement'

/**
 * Achievement for jumping in the world.
 */
export default class JumpAchievement extends Achievement {

    /**
     * Constructor for the jump achievement.
     * @param {object} props Properties for the achievement.
     */
    constructor(props) {
        super(Object.assign({
            names: [ 'First Jump', 'Jumping Jack', 'Jumping Jill', 'Jumping Pro', 'Too Much Jumping' ],
            descriptions: [ 'Jump for the first time.', 'Jump 10 times.', 'Jump 100 times.', 'Jump 10 000 times.', 'Jump 100 000 times.' ],
            thresholds: [ 1, 10, 100, 10_000, 100_000 ],
            images: [
                require('../../images/jump-1.png'),
                require('../../images/jump-2.png'),
                require('../../images/jump-3.png'),
                require('../../images/jump-4.png'),
                require('../../images/jump-5.png'),
            ]
        }, props))
    }

    /**
     * Starts monitoring for this achievement.
     * @param {(id: string, progress: number) => void} updateCallback Callback used to update the achievement.
     */
    start(updateCallback) {
        metapress.plugins.addEventListener('avatar_jump', () => updateCallback(this.id, 1, process.env.SIGN))
    }

}
