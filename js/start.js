import metadata from '../package.json'
import AchievementManager from './AchievementManager'

/**
 * Tracks user progress and awards achievements.
 */
export default class AchievementsPlugin {

    // Plugin information
    id = metadata.metapress?.id || metadata.name
    name = metadata.metapress?.name || metadata.name
    description = metadata.metapress?.description || metadata.description
    version = metadata.version
    provides = []
    requires = []

    /** @type {AchievementManager} Achievement manager. */
    manager = null

    /** Called on load */
    onLoad() {
        window.addEventListener('beforeunload', this.onUnload)

        // Load from storage
        this.manager = new AchievementManager()
    }

    /** Called before this plugin is unloaded */
    onUnload = () => {
        this.manager.save()
    }

    /** Called when the user enters the world */
    $loader_onEnterWorld() {
        this.manager.checkForChanges()
        this.manager.startMonitoring()
    }

    $ai_getKnowledgeBaseEntries = () => [
        {
            id: `${this.id}:InfoAchievements`,
            type: "info",
            name: "Achievements",
            tags: "achievements, info, about",
            content: `\nAssistant instruction: Use this action to get information about the achievements system.
                Internal Achievements loaded: \n ${this.manager._internalAchievements.map(a => `name - ${a.name} description - ${a.description}`)}
                ${this.manager._externalAchievements[0] ? `Internal Achievements loaded: \n ${this.manager._externalAchievements.map(a => `name - ${a.name} description - ${a.description}`)}`: ''}
            `,
        }
    ]


}
