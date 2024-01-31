import metadata from '../package.json'
import AchievementManager from './AchievementManager'

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

    /** Sets up the time tracking achievement progress */
    setupTimeTracking() {
        if (this._timeTimer) {
            clearInterval(this._timeTimer)
        }

        // Update time on a regular basis
        this._timeTimer = setInterval(() => {
            this.manager.update('time', TIME_INTERVAL, process.env.SIGN)
        }, TIME_INTERVAL)
    }

    /** Called when the user enters the world */
    $loader_onEnterWorld() {
        this.setupTimeTracking()
    }

}
