import CryptoJS from 'crypto-js'

import Achievement from './Achievement'
import NotificationsUI from './ui/NotificationsUI'

const MOVE_ID = 'move'
const JUMP_ID = 'jump'
const TIME_ID = 'time'
const INTERNAL_IDS = [ MOVE_ID, JUMP_ID, TIME_ID ]

/**
 * Manager for all achievements.
 */
export default class AchievementManager {

    /**
     * @private List of all achievements.
     * @type {Achievement[]}
     */
    _achievements = []

    /**
     * @private Reference to the notifications UI.
     * @type {NotificationsUI}
     */
    _notificationsRef = null

    /** Constructor for the achievement manager. */
    constructor() {
        let shouldSave = false
        try {
            const key = localStorage.getItem('achievements') || null
            if (key == null) {
                throw new Error('No previous achievements.')
            }

            this.load(key)
        } catch (err) {
            console.warn('[Achievements] Failed to load previous achievements.', err)
            this._addInternal()
            shouldSave = true
        }

        // No achievements found
        if (this._achievements.length < 1) {
            this._addInternal()
            shouldSave = true
        }

        // Register UI
        this._notificationsRef = new NotificationsUI()

        // Listen for if an achievement has been unlocked
        metapress.addEventListener('achievement.unlocked', this.onAchievementUnlocked)

        // Save achievements on a regular basis
        if (shouldSave) this.save()
        setInterval(() => {
            this.save()
        }, 1000 * 60)
    }

    /** @private Adds internal achievements. */
    _addInternal() {
        // Movement tracking
        this.add(new Achievement({
            id: MOVE_ID,
            names: [ 'Learn to Move', 'Let\'s Get Moving', 'Now We\'re Moving', 'Movement Pro', 'Movement Master' ],
            descriptions: [ 'Move 1 metre.', 'Move 50 metres.', 'Move 1 000 metres.', 'Move 50 000 metres.', 'Move 1 000 000 metres.' ],
            thresholds: [
                { min: 0, max: 1 },
                { min: 2, max: 50 },
                { min: 51, max: 1000 },
                { min: 1001, max: 50_000 },
                { min: 50_001, max: 1_000_000 }
            ],
            images: [
                require('../images/move-1.svg'),
                require('../images/move-2.svg'),
                require('../images/move-3.svg'),
                require('../images/move-4.svg'),
                require('../images/move-5.svg'),
            ]
        }))

        // Jump tracking
        this.add(new Achievement({
            id: JUMP_ID,
            names: [ 'First Jump', 'Jumping Jack', 'Jumping Jill', 'Jumping Pro', 'Too Much Jumping' ],
            descriptions: [ 'Jump for the first time.', 'Jump 10 times.', 'Jump 100 times.', 'Jump 10 000 times.', 'Jump 100 000 times.' ],
            thresholds: [
                { min: 0, max: 1 },
                { min: 2, max: 10 },
                { min: 11, max: 100 },
                { min: 101, max: 10_000 },
                { min: 10_001, max: 100_000 }
            ],
            images: [
                require('../images/jump-1.svg'),
                require('../images/jump-2.svg'),
                require('../images/jump-3.svg'),
                require('../images/jump-4.svg'),
                require('../images/jump-5.svg'),
            ]
        }))

        // Time tracking
        this.add(new Achievement({
            id: TIME_ID,
            names: [ 'Time Flies', 'Time Flies Faster', 'Time Flies Fastest', 'Time Flies Too Fast' ],
            descriptions: [ 'Spend 1 minute in the world.', 'Spend 10 minutes in the world.', 'Spend 1 hour in the world.', 'Spend 1 day in the world.' ],
            thresholds: [
                { min: 0, max: 60_000 },
                { min: 60_001, max: 600_000 },
                { min: 600_001, max: 3_600_000 },
                { min: 3_600_001, max: 86_400_000 }
            ],
            images: [
                require('../images/time-1.svg'),
                require('../images/time-2.svg'),
                require('../images/time-3.svg'),
                require('../images/time-4.svg'),
            ]
        }))
    }

    /** Called when an achievement has been unlocked */
    onAchievementUnlocked = data => {
        this.save()
    }

    /**
     * Adds an achievement.
     * @param {Achievement} achievement Achievement to add.
     */
    add(achievement) {
        if (!achievement || typeof achievement != 'object' || Object.keys(achievement).length < 1 || !(achievement instanceof Achievement)) {
            console.warn('[Achievements] Attempted to add an invalid achievement.')
            return
        }

        // Not allowed to duplicate achievements
        if (this._achievements.find(a => a.id === achievement.id)) {
            console.warn('[Achievements] Achievement with identifier "' + achievement.id + '" already exists.')
            return
        }

        // Not allowed to use reserved identifiers
        if (achievement.id === 'all') {
            console.warn('[Achievements] Identifier "all" is reserved and cannot be used.')
            return
        }

        this._achievements.push(achievement)
    }

    /** @returns Achievement matching the given identifier, or `null` if no achievement found. */
    get(id) {
        return this._achievements.find(achievement => achievement.id === id) || null
    }

    /**
     * Updates the achievement that matches the given identifier.
     * @param {string} id Identifier of the achievement to update.
     * @param {number} progress Progress amount to increase achievement by.
     */
    update(id, progress, sign = '') {
        if (id == null) {
            throw new Error('Achievement identifier must be provided.')
        }

        // Prevent unauthorized changes to internal achievements
        if (INTERNAL_IDS.includes(id) && (!sign || sign != process.env.SIGN)) {
            console.warn('[Achievements] Attempted to update an internal achievement without proper authorization.')
            return
        }

        let hasUpdated = false
        for (let idx = 0; idx < this._achievements.length; idx++) {
            if (this._achievements[idx].id === id) {
                this._achievements[idx].update(progress)
                hasUpdated = true
                break
            }
        }

        if (!hasUpdated) {
            console.warn('[Achievement] Could not find achievement with id = "' + id + '".')
        }
    }

    /**
     * Removes an achievement from the list.
     * @param {string} id Identifier of the achievement to remove.
     */
    remove(id) {
        if (!id) {
            throw new Error('Achievement identifier must be provided.')
        }

        // Prevent unauthorized changes to internal achievements
        if (INTERNAL_IDS.includes(id)) {
            console.warn('[Achievement] Attempted to remove an internal achievement without proper authorization.')
            return
        }

        const idx = this._achievements.findIndex(achievement => achievement.id === id)
        if (idx < 0) {
            console.warn('[Achievement] Could not find achievement with id = "' + id + '".')
            return
        }

        // Remove
        this._achievements.splice(idx, 1)
    }

    /**
     * Resets the achievement that matches the given identifier.
     * @param {string} id Identifier of the achievement to reset.
     * @param {boolean} overall `true` if the entire achievement should be reset, `false` if only the current level should be reset.
     */
    reset(id, overall = false, sign = '', preventSave = false) {
        if (!id) {
            throw new Error('Achievement identifier must be provided.')
        }

        // Prevent unauthorized changes to internal achievements
        if ((id === 'all' || INTERNAL_IDS.includes(id)) && (!sign || sign != process.env.SIGN)) {
            console.warn('[Achievements] Attempted to reset an internal achievement without proper authorization.')
            return
        }

        // Reset specific achievement
        let hasReset = false
        for (let idx = 0; idx < this._achievements.length; idx++) {
            if (id !== 'all' && this._achievements[idx].id != id) {
                continue
            }

            this._achievements[idx].reset(overall)
            hasReset = true

            if (id !== 'all') {
                break
            }
        }

        // Save if we have reset an achievement
        if (hasReset && !preventSave) {
            this.save()
        }
    }

    /**
     * Loads the achievements from an encrypted string.
     * @param {string} str Encrypted string to load achievements from.
     */
    load(str) {
        const encryptedData = str.slice(0, -64) // Remove the last 64 characters (SHA256 hash)
        const checkValue = str.slice(-64)
        const decryptedString = CryptoJS.AES.decrypt(encryptedData, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8)

        // Verify check value
        if (checkValue !== CryptoJS.SHA256(decryptedString).toString(CryptoJS.enc.Hex)) {
            throw new Error('Data integrity check failed. Achievement data may have been tampered with.')
        }

        // Done
        try {
            const rawAchievements = JSON.parse(decryptedString)

            // Convert to actual achievement instances, since we lose this when serializing
            rawAchievements.forEach(raw => {
                const achievement = new Achievement({
                    ...raw._settings,
                    progress: raw._progress,
                    level: raw._level,
                })
                this.add(achievement)
            })
        } catch (err) {
            throw new Error('Failed to decrypt data. ' + err.message)
        }
    }

    /** @private Performs the achievements saving */
    _performSave() {
        const serialized = JSON.stringify(this._achievements)
        const encrypted = CryptoJS.AES.encrypt(serialized, process.env.SECRET_KEY).toString()
        const checkValue = CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex)

        // Save
        localStorage.setItem('achievements', encrypted + checkValue)
    }

    /** @private Performs a reset for all, or specific, achievements */
    _performReset(previous) {
        const sepIdx = previous.indexOf(':')

        // Usage: Various ways to reset achievements by setting `localStorage['achievements']` to:
        //   1. `reset` - Resets all achievements
        //   2. `reset:all` - Resets all achievements, same as above
        //   3. `reset:<id>` - Resets a specific achievement, if it exists
        //   4. `reset:<id_1>,<id_2>` - Resets each achievement one by one, skipping any that do not exist

        if (sepIdx < 0) {

            // Hard reset every achievement
            localStorage.removeItem('achievements')

        } else {

            // Reset specific achievement
            const ids = previous.slice(sepIdx + 1)
            const split = ids.split(',')

            if (ids === 'all') {

                localStorage.removeItem('achievements')

            } else {

                // Reset each achievement individually.
                // Save on each is to prevent race conditions.
                for (let idx = 0; idx < split.length; idx++) {
                    if (!split[idx] || typeof split[idx] != 'string' || split[idx].length < 1) continue

                    this.reset(split[idx], true, process.env.SIGN, true)
                    this._performSave()
                }

            }

        }
    }

    /** Saves the current achievements and progress to storage */
    save() {

        // BACKUP: In case of emergency, we can reset all, or specific, achievements
        const previous = localStorage.getItem('achievements')
        if (previous != null && typeof previous == 'string' && previous.startsWith('reset')) {
            this._performReset(previous)
            return
        }

        // Save
        this._performSave()

    }

}
