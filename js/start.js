/**
 * Tracks user progress and awards achievements.
 */

import packageJson from '../package.json'

export default class AchievementsPlugin {

    // Plugin information
    id              = packageJson.metapress?.id || packageJson.name
    name            = packageJson.metapress?.name || packageJson.name
    description     = packageJson.metapress?.description || packageJson.description
    version         = packageJson.version
    provides        = [ ]
    requires        = [ ]

    /** Called on load */
    onLoad() {

        console.log(`Hello from ${this.name}!`)

    }

}
