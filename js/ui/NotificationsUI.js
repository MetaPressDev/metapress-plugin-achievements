import { v4 as uuidv4 } from 'uuid'

/** Identifier of the container in which to keep the achievements */
const CONTAINER_ID = 'achievement-notifications-container'

/** Height of each notification */
const HEIGHT = 70

/** Number of pixels gap between each notification */
const GAP = 7

/**
 * User interface for achievement notifications.
 */
export default class NotificationsUI {

    /**
     * @private Element that contains all achievements.
     * @type {HTMLDivElement}
     */
    _container = null

    /**
     * @private List of all currently shown achievement notifications.
     * @type {Notification[]}
     */
    _notifications = []

    /** Constructor for the notifications UI */
    constructor() {
        this._init()
    }

    /** Initialize notifications UI */
    _init() {
        if (!metapress?.contentDiv) {
            setTimeout(() => this._init(), 1000)
        }

        const style = document.createElement('style')
        style.innerHTML = `

            #${CONTAINER_ID} {
                position: absolute;
                bottom: 10px;
                right: 10px;
                width: 240px;
                pointer-events: none;
                z-index: 2;
            }

            @media (max-width: 666px) {
                bottom: 80px;
            }

        `
        metapress.contentDiv.appendChild(style)

        // Create container
        this._container = document.createElement('div')
        this._container.id = CONTAINER_ID
        metapress.contentDiv.appendChild(this._container)

        // Listen for any achievements that are unlocked
        metapress.addEventListener('achievement.unlocked', this.onAchievementUnlocked)
    }

    /** Called when an achievement has been unlocked */
    onAchievementUnlocked = data => {
        if (data?.sign && data.sign === process.env.SIGN) {
            this.show(data)
        }
    }

    /**
     * Shows the achievement notification.
     * @param {object} data Data about the unlocked achievement.
     * @param {string} data.name Name of the unlocked achievement.
     * @param {string} data.description Description of the unlocked achievement.
     * @param {string} data.image Image to use for the notification.
     * @param {boolean=} force `true` to force the achievement to show, `false` otherwise.
     */
    show(data, force = false) {
        if (!force && this._notifications.findIndex(n => n.name == data.name) >= 0) {
            return
        }

        const notification = new Notification({
            name: data.name,
            description: data.description,
            image: data.image,
            index: this._notifications.length
        })
        this._notifications.push(notification)

        setTimeout(async () => {
            await this.close(notification._id)

            // Update positions of all remaining achievements
            for (let idx = 0; idx < this._notifications.length; idx++) {
                this._notifications[idx].update(idx)
            }
        }, 5000)
    }

    /**
     * Closes the notification.
     * @param {string} id Identifier of the notification to close.
     */
    async close(id) {
        for (let idx = 0; idx < this._notifications.length; idx++) {
            if (this._notifications[idx]._id != id) {
                continue
            }

            await this._notifications[idx].delete()
            this._notifications.splice(idx, 1)
            break
        }
    }

}

/**
 * Represents a single notification
 */
class Notification {

    /** @private Identifier of this notification */
    _id = ''

    /** @private Name of the achievement */
    _name = ''

    /** @private Description of the achievement */
    _description = ''

    /** @private Achievement image */
    _image = ''

    /** @private Used to adjust the position of this notification */
    _index = 0

    /** @type {HTMLDivElement} Notification element */
    element = null

    /**
     * Constructor for a single notification.
     * @param {object} data Data about the achievement.
     * @param {string} data.name Name of the achievement.
     * @param {string} data.description Description of the achievement.
     * @param {string} data.image Image to use for the notification.
     * @param {number} data.index How much to adjust the notification's position by.
     */
    constructor(data) {
        this._id = uuidv4()
        this._name = data.name
        this._description = data.description
        this._image = data.image
        this._index = data.index

        // Create the notification element
        this.create()
    }

    /** Identifier of this notification */
    get id() {
        return this._id
    }

    /** Name used as the title for the notification */
    get name() {
        return this._name
    }

    /** Creates the notification */
    create() {
        if (this.element) {
            return
        }

        this.element = document.createElement('div')
        this.element.id = 'achievement-notification-' + this._id.slice(0, 8)
        this.element.style.cssText = `display: flex; position: absolute; bottom: ${this._index * (HEIGHT + GAP)}px; right: -260px; width: 240px; height: 70px; flex-shrink: 0; border-radius: 5px; border: 1px solid #1B1B1B; background: #353535; box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.25); overflow: hidden; align-items: center; transition: all 0.35s ease;`

        // Image
        const imgWidth = 55
        const imageContainer = document.createElement('div')
        imageContainer.style.cssText = `display: flex; width: ${imgWidth}px; height: 70px; background: #4B4B4B; flex-shrink: 0; justify-content: center; align-items: center;`

        const image = document.createElement('img')
        image.src = this._image
        image.style.cssText = `width: 100%; height: 100%;`

        imageContainer.appendChild(image)
        this.element.appendChild(imageContainer)

        // Text
        const textContainer = document.createElement('div')
        textContainer.style.cssText = `display: flex; flex-direction: column; width: calc(100% - ${imgWidth}px); height: 100%; flex: 1 1 auto; padding: 8px 10px; box-sizing: border-box; justify-content: space-evenly;`

        const name = document.createElement('div')
        name.style.cssText = `width: 100%; font-size: 13px; color: #FFFFFF; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;`
        name.innerText = this._name

        const description = document.createElement('div')
        description.style.cssText = `display: -webkit-box; font-size: 11px; color: #9E9E9E; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;`
        description.innerText = this._description

        textContainer.appendChild(name)
        textContainer.appendChild(description)
        this.element.appendChild(textContainer)

        // Add to DOM
        document.getElementById(CONTAINER_ID).appendChild(this.element)

        // Trigger animation
        setTimeout(() => this.element.style.right = 0, 10)
    }

    /** Updates the position of this notification */
    update(index) {
        this._index = index

        if (!this.element) {
            return
        }

        this.element.style.bottom = this._index * (HEIGHT + GAP) + 'px'
    }

    /** Deletes this notification */
    async delete() {
        if (!this.element) {
            return
        }

        this.element.style.opacity = 0

        // Wait for element to disappear before removing from DOM
        await new Promise(resolve => setTimeout(() => resolve(), 350))
        this.element.remove()
        this.element = null
    }

}
