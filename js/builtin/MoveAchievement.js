import Achievement from '../Achievement'

/**
 * Achievement for moving around in the world.
 */
export default class MoveAchievement extends Achievement {

    /** Timer used to push updates to achievement manager */
    _updateTimer = null

    /** Interval between updates, in milliseconds */
    _timeInterval = 250

    /**
     * Constructor for the move achievement.
     * @param {object} props Properties for the achievement.
     */
    constructor(props) {
        super(Object.assign({
            names: [ "Learn to Move", "Let's Get Moving", "Now We're Moving", "Movement Pro", "Movement Master" ],
            descriptions: [ 'Move 1 metre.', 'Move 50 metres.', 'Move 1 000 metres.', 'Move 50 000 metres.', 'Move 1 000 000 metres.' ],
            thresholds: [
                { min: 0, max: 1 },
                { min: 2, max: 50 },
                { min: 51, max: 1_000 },
                { min: 1_001, max: 50_000 },
                { min: 50_001, max: 1_000_000 }
            ],
            images: [
                require('../../images/move-1.svg'),
                require('../../images/move-2.svg'),
                require('../../images/move-3.svg'),
                require('../../images/move-4.svg'),
                require('../../images/move-5.svg'),
            ]
        }, props))
    }

    /**
     * Starts monitoring for this achievement.
     * @param {(id: string, progress: number) => void} updateCallback Callback used to update the achievement.
     */
    start(updateCallback) {
        if (metapress?.avatars?.currentUserEntity == null) {
            setTimeout(() => this.start(updateCallback), 2000)
            return
        }

        const renderer = metapress.entities.getRenderer(metapress.avatars.currentUserEntity.id)
        if (!renderer || !renderer._loaded) {
            setTimeout(() => this.start(updateCallback), 2000)
            return
        }

        if (this._updateTimer) {
            clearInterval(this._updateTimer)
        }

        // Not including `y` because then user can get achievement easily by just
        // jumping up and down
        let lastX = metapress?.avatars?.currentUserEntity?.x || 0
        let lastZ = metapress?.avatars?.currentUserEntity?.z || 0

        // Update movement on a regular basis
        this._updateTimer = setInterval(() => {
            let x = metapress?.avatars?.currentUserEntity?.x || 0
            let z = metapress?.avatars?.currentUserEntity?.z || 0

            let distance = Math.sqrt(
                (x - lastX) ** 2 +
                (z - lastZ) ** 2
            )

            // Update last known position
            lastX = x
            lastZ = z

            // No need to track if the distance is too small
            if (distance < 0.01) {
                return
            }

            updateCallback(this.id, distance, process.env.SIGN)
        }, this._timeInterval)
    }

}
