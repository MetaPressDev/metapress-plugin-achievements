import metadata from '../package.json'
import AchievementManager from './AchievementManager'

/** Interval between each achievement update */
const TIME_INTERVAL = 250

/**
 * Tracks user progress and awards achievements.
 */
export default class AchievementsPlugin {

    // Plugin information
    id              = metadata.metapress?.id || metadata.name
    name            = metadata.metapress?.name || metadata.name
    description     = metadata.metapress?.description || metadata.description
    version         = metadata.version
    provides        = [ ]
    requires        = [ ]

    /** @type {AchievementManager} Achievement manager. */
    manager = null

    /** Timer used to track movement achievement progress. */
    _moveTimer = null

    /** Timer used to track time achievement progress. */
    _timeTimer = null

    /** Called on load */
    onLoad() {
        window.addEventListener('beforeunload', this.onUnload)

        // Load from storage
        this.manager = new AchievementManager()
    }

    /** Called before this plugin is unloaded */
    onUnload = () => {
        if (this._timeTimer) clearInterval(this._timeTimer)
        this.manager.save()
    }

    /** Sets up the movement tracking achievement */
    async trackMove() {
        if (metapress?.avatars?.currentUserEntity == null) {
            return false
        }

        const renderer = metapress.entities.getRenderer(metapress.avatars.currentUserEntity.id)
        if (!renderer || !renderer._loaded) {
            return false
        }

        if (this._moveTimer) {
            clearInterval(this._moveTimer)
        }

        // Not including `y` because then user can get achievement easily by just
        // jumping up and down
        let lastX = metapress?.avatars?.currentUserEntity?.x || 0
        let lastZ = metapress?.avatars?.currentUserEntity?.z || 0

        // Update movement on a regular basis
        this._moveTimer = setInterval(() => {
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

            this.manager.update('move', distance, process.env.SIGN)
        }, TIME_INTERVAL)

        return true
    }

    /** Sets up the time tracking achievement progress */
    async trackTime() {
        if (this._timeTimer) {
            clearInterval(this._timeTimer)
        }

        // Update time on a regular basis
        this._timeTimer = setInterval(() => {
            this.manager.update('time', TIME_INTERVAL, process.env.SIGN)
        }, TIME_INTERVAL)
    }

    /** Called when the user has jumped */
    $avatar_jump() {
        if (!this.manager) {
            return
        }

        this.manager.update('jump', 1, process.env.SIGN)
    }

    /** Checks if the move achievement has started tracking progress */
    async checkMove() {
        const success = await this.trackMove()
        if (!success) {
            setTimeout(() => this.checkMove(), 2000)
        }
    }

    /** Called when the user enters the world */
    $loader_onEnterWorld() {
        Promise.allSettled([ this.trackTime(), this.trackMove() ]).then(results => {

            // Failed to start movement tracker, so retry until it has been started
            if (!results[1].value) {
                this.checkMove()
            }

        })
    }

}
