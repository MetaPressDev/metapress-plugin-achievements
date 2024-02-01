/**
 * User interface for achievement notifications.
 */
export default class NotificationsUI {

    /**
     * @private Element that contains all achievements.
     * @type {HTMLDivElement}
     */
    _container = null

    /** Constructor for the notifications UI */
    constructor() {
        const style = document.createElement('style')
        style.innerHTML = `

            #achievement-notifications-container {
                position: absolute;
                bottom: 10px;
                right: 10px;
                width: 240px;
                pointer-events: none;
                z-index: 2;
            }

        `
        metapress.contentDiv.appendChild(style)

        // Create container
        this._container = document.createElement('div')
        this._container.id = 'achievement-notifications-container'
        metapress.contentDiv.appendChild(this._container)

        // Listen for any achievements that are unlocked
        metapress.addEventListener('achievement.unlocked', this.onAchievementUnlocked)
    }

    /** Called when an achievement has been unlocked */
    onAchievementUnlocked = data => {
        this.show(data)
        console.log('== unlocked achievement!', data)
    }

    /**
     * Shows the achievement notification.
     * @param {object} data Data about the unlocked achievement.
     * @param {string} data.id Identifier of the unlocked achievement.
     * @param {string} data.name Name of the unlocked achievement.
     * @param {string} data.description Description of the unlocked achievement.
     */
    show(data) {

    }

}
