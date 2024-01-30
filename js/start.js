import metadata from '../package.json'

import Achievement from './Achievement'

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

    /** Time at which the user has started to be in this world */
    startTime = 0

    /** Called on load */
    onLoad() {
        window.addEventListener('beforeunload', this.onUnload)
    }

    /** Called before this plugin is unloaded */
    onUnload = () => {
        // this.track('time', { time: Date.now() - this.startTime })
    }

    /** Called when the user enters the world */
    $loader_onEnterWorld() {
        this.startTime = Date.now()

        let achievement = new Achievement({
            names: [ "Let's Walk", "Stroll Time" ],
            descriptions: [ "Walk 10 metres.", "Walk 100 metres." ],
            thresholds: [
                { min: 0, max: 10 },
                { min: 11, max: 100 }
            ],
            level: 0,
            progress: 3
        })

        achievement.print()

        setTimeout(() => {
            achievement.update(12)
            achievement.print()
        }, 10000)
    }

}
