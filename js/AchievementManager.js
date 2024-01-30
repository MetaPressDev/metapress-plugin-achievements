import CryptoJS from 'crypto-js'

import Achievement from './Achievement'

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

    /** Constructor for the achievement manager. */
    constructor() {
        try {
            const key = localStorage.getItem('achievements') || null
            if (key == null) {
                throw new Error('No previous achievements.')
            }

            this.load(key)
        } catch (err) {
            console.warn('[Achievements] Failed to load previous achievements.', err)
            this._addInternal()
        }

        // No achievements found
        if (this._achievements.length < 1) {
            this._addInternal()
        }
    }

    /** @private Adds internal achievements. */
    _addInternal() {
        // Movement tracking
        this.add(new Achievement({
            id: MOVE_ID,
            names: [ 'Learn to Move', 'Now We\'re Moving', 'Movement Pro', 'Movement Master' ],
            descriptions: [ 'Move 10 metres.', 'Move 100 metres.', 'Move 10000 metres.', 'Move 1000000 metres.' ],
            thresholds: [
                { min: 0, max: 10 },
                { min: 11, max: 100 },
                { min: 101, max: 10_000 },
                { min: 10_001, max: 1_000_000 }
            ]
        }))

        // Jump tracking
        this.add(new Achievement({
            id: JUMP_ID,
            names: [ 'Jumping Jack', 'Jumping Jill', 'Jumping Pro', 'Too Much Jumping' ],
            descriptions: [ 'Jump 10 times.', 'Jump 100 times.', 'Jump 10000 times.', 'Jump 1000000 times.' ],
            thresholds: [
                { min: 0, max: 10 },
                { min: 11, max: 100 },
                { min: 101, max: 10_000 },
                { min: 10_001, max: 1_000_000 }
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
            ]
        }))
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
            console.warn('[Achievement] Could not find achievement with id="' + id + '".')
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

    /** Saves the current achievements and progress to storage */
    save() {
        const serialized = JSON.stringify(this._achievements)
        const encrypted = CryptoJS.AES.encrypt(serialized, process.env.SECRET_KEY).toString()
        const checkValue = CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex)

        // Save
        localStorage.setItem('achievements', encrypted + checkValue)
    }

}
