import CryptoJS from 'crypto-js'

import Achievement from './Achievement'
import NotificationsUI from './ui/NotificationsUI'
import PanelUI from './ui/PanelUI'

import MoveAchievement from './builtin/MoveAchievement'
import JumpAchievement from './builtin/JumpAchievement'
import TimeAchievement from './builtin/TimeAchievement'
import CustomAchievement from './builtin/CustomAchievement'

const MOVE_ID = 'move'
const JUMP_ID = 'jump'
const TIME_ID = 'time'

/**
 * Manager for all achievements.
 */
export default class AchievementManager {

    /**
     * @private List of all achievements.
     * @type {Achievement[]}
     */
    _achievements = []

    /** @private List of internal achievements. */
    _internalAchievements = [
        new MoveAchievement({ id: MOVE_ID }),
        new JumpAchievement({ id: JUMP_ID }),
        new TimeAchievement({ id: TIME_ID }),
    ]

    /** @private Identifiers of every internal achievement. */
    _internalAchievementIds = [ MOVE_ID, JUMP_ID, TIME_ID ]

    /**
     * @private List of external achievements, registered by other plugins.
     * @type {Achievement[]}
     */
    _externalAchievements = []

    /**
     * @private Reference to the notifications UI.
     * @type {NotificationsUI}
     */
    _notificationsRef = null

    /**
     * @private Reference to the panel UI.
     * @type {PanelUI}
     */
    _panelRef = null

    /** @private Settings that need to be applied when loading external achievement */
    _externalSettings = {}

    /** `true` if we have started to monitor for achievements, `false` otherwise */
    started = false

    /** Constructor for the achievement manager. */
    constructor() {
        this._init()
    }

    /** Initializes all achievement details */
    async _init() {
        if (!window.metapress) {
            setTimeout(() => this._init(), 3000)
            return
        }

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

        // Register UI
        this._notificationsRef = new NotificationsUI()
        this._panelRef = new PanelUI(this)

        // Listen for if an achievement has been unlocked
        metapress.addEventListener('achievement.unlocked', this.onAchievementUnlocked)

        // Save achievements on a regular basis
        this.save()
        setInterval(() => {
            this.save()
        }, 1000 * 60)
    }

    /** @private Adds internal achievements. */
    _addInternal() {
        for (let idx = 0; idx < this._internalAchievements.length; idx++) {
            this.add(this._internalAchievements[idx])
        }
    }

    /**
     * @private Makes changes to the current achievement based on if the original has changed.
     * @param {number} idx Index into the achievements array.
     * @param {Achievement} original Original achievement to compare against.
     */
    _makeChanges(idx, original) {
        const settings = original._settings
        const achievement = this._achievements[idx]

        // No need to do any checking here
        this._achievements[idx]._settings.names = settings.names
        this._achievements[idx]._settings.descriptions = settings.descriptions
        this._achievements[idx]._settings.images = settings.images
        this._achievements[idx]._settings.colors = settings.colors

        let hasThresholdChanged = false
        if (settings.thresholds.length !== achievement._settings.thresholds.length) {

            // Number of thresholds have changed
            this._achievements[idx]._settings.thresholds = settings.thresholds
            hasThresholdChanged = true

        } else {

            // Check each threshold for a change
            for (let tIdx = 0; tIdx < achievement._settings.thresholds.length; tIdx++) {
                if (settings.thresholds[tIdx] !== achievement._settings.thresholds[tIdx]) {
                    this._achievements[idx]._settings.thresholds = settings.thresholds
                    hasThresholdChanged = true
                    break
                }
            }

        }

        // We are now in a different threshold bracket
        if (hasThresholdChanged) {
            let newLevel = -1
            let cumulative = 0
            for (let tIdx = 0; tIdx < this._achievements[idx]._settings.thresholds.length; tIdx++) {
                // Add at the start since this value is how much progress is needed
                // to go above this level
                cumulative += this._achievements[idx]._settings.thresholds[tIdx]

                if (this._achievements[idx].cumulativeProgress < cumulative) {
                    newLevel = tIdx
                    break
                }
            }

            if (newLevel === -1) {

                // We have completed every level
                newLevel = this._achievements[idx]._settings.thresholds.length - 1
                let newProgress = this._achievements[idx]._settings.thresholds[newLevel]

                this._achievements[idx]._settings.progress = newProgress
                this._achievements[idx]._settings.level = newLevel
                this._achievements[idx]._progress = newProgress
                this._achievements[idx]._cumulativeProgress = cumulative
                this._achievements[idx].level = `${newLevel}:${process.env.SIGN}`

            } else if (newLevel !== this._achievements[idx].level) {

                // Need to update level
                this._achievements[idx]._settings.progress = this._achievements[idx].progress
                this._achievements[idx]._settings.level = newLevel
                this._achievements[idx].level = `${newLevel}:${process.env.SIGN}`

            }
        }
    }

    /** @private Fetches a list of external achievements that need to be registered */
    _fetchExternalAchievements() {
        const additional = metapress.plugins.callAll('achievements_register').flat().filter(a => !!a)
        const unique = {}

        // Remove any duplicates by adding to a map, 
        for (let idx = 0; idx < additional.length; idx++) {
            unique[additional[idx].id] = additional[idx]
        }

        return Object.values(unique)
    }

    /**
     * Checks if the current achievements are different from the original ones,
     * in other words, if the current achievements are outdated.
     */
    checkForChanges() {
        const additional = this._fetchExternalAchievements()

        for (let idx = 0; idx < additional.length; idx++) {
            let props = { ...additional[idx] }

            let startFunc = props.start || null
            let stopFunc = props.stop || null
            delete props.start
            delete props.stop

            try {
                let settings = this._externalSettings[props.id] || {}
                let asAchievement = new CustomAchievement({
                    ...props,
                    ...settings
                }, startFunc, stopFunc)

                // Add as external achievement
                delete this._externalSettings[props.id]
                this.add(asAchievement, true)
            } catch (err) {
                console.warn('[Achievements] Unable to add custom achievement with id "' + (additional.id || '') + '".', err)
            }
        }

        for (let idx = 0; idx < this._achievements.length; idx++) {
            const achievement = this._achievements[idx]
            const internal = this._internalAchievements.find(a => a.id === achievement.id)

            if (internal) {

                // Make changes based on internal achievements
                this._makeChanges(idx, internal)

            }
        }

        // Save any changes immediately
        this.save()
    }

    /** Called when an achievement has been unlocked */
    onAchievementUnlocked = data => {
        if (data?.sign && data.sign === process.env.SIGN) {
            this.save()
        }
    }

    /** Start monitoring for all achievements */
    startMonitoring() {
        this.started = true

        // Start monitoring for achievements
        this._achievements.forEach(achievement => {

            // Stop any monitoring if we can
            if (achievement.stop && typeof achievement.stop === 'function') {
                achievement.stop()
            }

            if (achievement.start && typeof achievement.start === 'function') {
                achievement.start(this.update)
            }

        })
    }

    /**
     * Adds an achievement.
     * @param {Achievement} achievement Achievement to add.
     * @param {boolean} isExternal `true` if the achievement is external, `false` otherwise.
     */
    add(achievement, isExternal = false) {
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

        // Add to list of external achievements
        if (isExternal) {
            this._externalAchievements.push(achievement)
        }

        this._achievements.push(achievement)

        // Start tracking if we have provided the method
        if (this.started && achievement.start && typeof achievement.start === 'function') {
            achievement.start(this.update)
        }
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
    update = (id, progress, sign = '') => {
        if (id == null || typeof id != 'string' || id.length < 1) {
            throw new Error('Achievement identifier must be provided.')
        }

        if (progress == null || typeof progress != 'number' || progress < 0) {
            throw new Error('Achievement progress must be a positive number.')
        }

        // Prevent unauthorized changes to internal achievements
        if (this._internalAchievementIds.includes(id) && (!sign || sign != process.env.SIGN)) {
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
        if (this._internalAchievementIds.includes(id)) {
            console.warn('[Achievement] Attempted to remove an internal achievement without proper authorization.')
            return
        }

        const idx = this._achievements.findIndex(achievement => achievement.id === id)
        if (idx < 0) {
            console.warn('[Achievement] Could not find achievement with id = "' + id + '".')
            return
        }

        // Stop achievement if given the method
        if (this._achievements[idx].stop && typeof this._achievements[idx].stop === 'function') {
            this._achievements[idx].stop()
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
        if ((id === 'all' || this._internalAchievementIds.includes(id)) && (!sign || sign != process.env.SIGN)) {
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
     * @private Attempts to decrypt the given achievement string.
     * @param {string} str Achievement string to decrypt.
     */
    _decrypt(str, sign = '') {
        if (!sign || sign != process.env.SIGN) {
            throw new Error('Not allowed to decrypt achievements.')
        }

        const encryptedData = str.slice(0, -64) // Remove the last 64 characters (SHA256 hash)
        const checkValue = str.slice(-64)
        const decryptedString = CryptoJS.AES.decrypt(encryptedData, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8)

        // Verify check value
        if (checkValue !== CryptoJS.SHA256(decryptedString).toString(CryptoJS.enc.Hex)) {
            throw new Error('Data integrity check failed. Achievement data may have been tampered with.')
        }

        return JSON.parse(decryptedString)
    }

    /**
     * Loads the achievements from an encrypted string.
     * @param {string} str Encrypted string to load achievements from.
     */
    load(str) {
        try {
            const rawAchievements = this._decrypt(str, process.env.SIGN)

            // Convert to actual achievement instances, since we lose this when serializing
            rawAchievements.forEach(raw => {
                let achievement = null

                // Special achievement type
                if (this._internalAchievementIds.includes(raw._id)) {
                    if (raw._id === MOVE_ID) {
                        achievement = new MoveAchievement({
                            ...raw._settings,
                            id: MOVE_ID,
                            progress: raw._progress,
                            level: raw._level
                        })
                    } else if (raw._id === JUMP_ID) {
                        achievement = new JumpAchievement({
                            ...raw._settings,
                            id: JUMP_ID,
                            progress: raw._progress,
                            level: raw._level
                        })
                    } else if (raw._id === TIME_ID) {
                        achievement = new TimeAchievement({
                            ...raw._settings,
                            id: TIME_ID,
                            progress: raw._progress,
                            level: raw._level
                        })
                    }
                }

                if (!achievement) {

                    // No achievement yet, so must be external
                    this._externalSettings[raw._id] = {
                        progress: raw._progress,
                        level: raw._level,
                    }

                } else {

                    // Add internal achievement
                    this.add(achievement)

                }

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
