export default class AchievementUI {

    _container = null

    /** Constructor for the achievement UI */
    constructor() {
        const style = document.createElement('style')
        style.innerHTML = `

            #achievement-container {
                position: absolute;
                bottom: 10px;
                right: 10px;
                width: 240px;
                z-index: 2;
            }

        `
        metapress.contentDiv.appendChild(style)

        // Create container
        this._container = document.createElement('div')
        this._container.id = 'achievement-container'
        metapress.contentDiv.appendChild(this._container)

        // Listen for any achievements that are unlocked
        metapress.addEventListener('achievement.unlocked', this.onAchievementUnlocked)
    }

    onAchievementUnlocked = data => {
        this.show(data)
        console.log('== unlocked achievement!', data)
    }

    show(data) {

    }

}
