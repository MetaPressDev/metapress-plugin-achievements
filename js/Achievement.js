import { v4 as uuidv4 } from 'uuid'
import { toRoman } from './Utils'

/** Default colors for each achievement level */
const DEFAULT_COLORS = [
    { primary: '#B08D57', secondary: '#665233', tertiary: '#2F2516' },
    { primary: '#C0C0C0', secondary: '#5A5A5A', tertiary: '#343434' },
    { primary: '#D4AF37', secondary: '#836D28', tertiary: '#433710' },
    { primary: '#6292DB', secondary: '#3C5A86', tertiary: '#22324A' },
    { primary: '#A562DB', secondary: '#5E367D', tertiary: '#361F47' },
]

/**
 * A single achievement that can have a single level or multiple levels.
 */
export default class Achievement {

    /** @private Identifier for this achievement */
    _id = ''

    /** @private Level of the current achievement */
    _level = 0

    /** @private Progress in the current achievement level */
    _progress = 0

    /** @private Cumulative progress throughout all achievement levels */
    _cumulativeProgress = 0

    /** @private Settings applied to this achievement */
    _settings = {}

    /** @private Colors that should be used for each achievement level */
    _colors = []

    /** @private `true` if we have unlocked the highest level for this achievement, `false` otherwise */
    _hasUnlockedHighest = false

    /**
     * Constructor for a single achievement.
     * @param {object} settings Achievement settings.
     * @param {string} settings.id Identifier for this achievement.
     * @param {string[]} settings.names Names for each level of the achievement.
     * @param {string[]} settings.descriptions Descriptions for each level of the achievement.
     * @param {number[]} settings.thresholds Maximum values that denote the end of each level.
     * @param {string[]} settings.images Images for each level of the achievement.
     * @param {number=} settings.level Optional. Current level of the achievement. Default is 0.
     * @param {number=} settings.progress Optional. Current progress of the achievement in the current level. Must be irrespective of the minimum value of the level (e.g. if level is between 100 and 150, progress should be between 0 and 50). Default is 0.
     */
    constructor(settings = {}) {
        this.sanityCheck(settings)

        // Assign values
        this._id = settings.id || uuidv4()
        this._settings = settings
        this._level = settings.level || 0
        this._progress = settings.progress || 0
        this._colors = settings.colors || DEFAULT_COLORS
        this._hasUnlockedHighest = this._progress >= settings.thresholds[settings.thresholds.length - 1]
    }

    /** Identifier of the achievement */
    get id() {
        return this._id
    }

    set id(id) {
        throw new Error('Not allowed to set the achievement identifier.')
    }

    /** Name of the achievement */
    get name() {
        return this._settings.names[this._level]
    }

    set name(n) {
        throw new Error('Not allowed to set achievement name.')
    }

    /** Description of the current achievement level */
    get description() {
        return this._settings.descriptions[this._level]
    }

    set description(desc) {
        throw new Error('Not allowed to set achievement description.')
    }

    /** Level of the current achievement */
    get level() {
        return this._level
    }

    set level(lvl) {
        if (typeof lvl != 'string') {
            throw new Error('Not allowed to set achievement level.')
        }

        const split = lvl.split(':')
        if (split.length != 2) {
            throw new Error('Not allowed to set achievement level.')
        }

        const level = parseInt(split[0])
        if (isNaN(level)) {
            throw new Error('Not allowed to set achievement level.')
        }

        this._level = level
        this.update(0)
    }

    /** Progress in the current achievement level */
    get progress() {
        return this._progress
    }

    set progress(prog) {
        throw new Error('Not allowed to set achievement progress.')
    }

    /** Cumulative progress made throughout all achievement levels */
    get cumulativeProgress() {
        return this._cumulativeProgress
    }

    set cumulativeProgress(prog) {
        throw new Error('Not allowed to set achievement cumulative progress.')
    }

    /** Percentage of progress made in the current achievement level */
    get progressPercent() {
        return (this._progress / this._settings.thresholds[this._level]) * 100
    }

    /** Maximum amount of progress for this level */
    get progressMax() {
        return this._settings.thresholds[this._level]
    }

    set progressMax(max) {
        throw new Error('Not allowed to set achievement progress maximum.')
    }

    /** Image at the current achievement level */
    get image() {
        return this._settings.images[this._level]
    }

    set image(img) {
        throw new Error('Not allowed to set achievement image.')
    }

    /** Image for the next achievement */
    get nextImage() {
        return this._level + 1 >= this._settings.images.length
            ? require('../images/completed.svg')
            : this._settings.images[this._level + 1]
    }

    set nextImage(img) {
        throw new Error('Not allowed to set next achievement image.')
    }

    /** Colors for each achievement level */
    get colors() {
        return this._colors[this._level]
    }

    set colors(cols) {
        throw new Error('Not allowed to set achievement colors.')
    }

    /** Performs a sanity check to make sure we have all the correct data to continue. */
    sanityCheck(settings) {
        if (!settings || typeof settings != 'object' || Array.isArray(settings) || Object.keys(settings).length < 1) {
            throw new Error('Achievement settings must be an object with at least one field.')
        }

        if (!settings.names || !Array.isArray(settings.names) || settings.names.length < 1) {
            throw new Error('Achievement names must be an array with at least one element.')
        }

        if (!settings.descriptions || !Array.isArray(settings.descriptions) || settings.descriptions.length < 1) {
            throw new Error('Achievement descriptions must be an array with at least one element.')
        }

        if (!settings.thresholds || !Array.isArray(settings.thresholds) || settings.thresholds.length < 1) {
            throw new Error('Achievement thresholds must be an array with at least one element.')
        }

        if (!settings.images || !Array.isArray(settings.images) || settings.images.length < 1) {
            throw new Error('Achievement images must be an array with at least one element.')
        }

        if (!settings.colors && settings.names.length > DEFAULT_COLORS.length) {
            throw new Error('Achievement colors must be given if there are more than the default number of levels.')
        }

        if (settings.colors && (!Array.isArray(settings.colors) || settings.colors.length < 1)) {
            throw new Error('Achievement colors must be an array with at least one element.')
        }

        if (settings.names.length != settings.descriptions.length || settings.names.length != settings.thresholds.length || settings.names.length != settings.images.length) {
            throw new Error('Achievement names, descriptions, thresholds, and images must have the same number of elements.')
        }

        if (settings.colors && settings.names.length != settings.colors.length) {
            throw new Error('Achievement colors must have the same number of elements as names, descriptions, thresholds and images.')
        }

        if (settings.colors) {
            let errMsg = 'Each achievement color must have a primary, secondary, and tertiary value in the form of a hexadecimal string.'
            let regex = /\#[A-Fa-f0-9]{6}/

            for (let i = 0; i < settings.colors.length; i++) {
                let color = settings.colors[i]

                if (color.primary == null || typeof color.primary != 'string' || color.primary.length != 7 || color.primary[0] != '#' || !regex.test(color.primary)) {
                    throw new Error(errMsg)
                }

                if (color.secondary == null || typeof color.secondary != 'string' || color.secondary.length != 7 || color.secondary[0] != '#' || !regex.test(color.secondary)) {
                    throw new Error(errMsg)
                }

                if (color.tertiary == null || typeof color.tertiary != 'string' || color.tertiary.length != 7 || color.tertiary[0] != '#' || !regex.test(color.tertiary)) {
                    throw new Error(errMsg)
                }
            }
        }

        for (let idx = 0; idx < settings.thresholds.length; idx++) {
            if (typeof settings.thresholds[idx] != 'number') {
                throw new Error('Each achievement threshold must be a number.')
            }

            if (idx > 0) {
                if (settings.thresholds[idx] <= settings.thresholds[idx - 1]) {
                    throw new Error('Each successive achievement threshold must be greater than the threshold of the previous level.')
                }
            }
        }

        if (settings.level != null) {
            if (typeof settings.level != 'number') {
                settings.level = parseInt(settings.level) || 0
            }

            if (settings.level >= settings.thresholds.length) {
                throw new Error('Achievement level must be within the number of levels given.')
            }
        }

        if (settings.progress != null) {
            if (typeof settings.progress != 'number') {
                settings.progress = parseInt(settings.progress) || 0
            }

            if (settings.progress < 0) {
                throw new Error('Achievement progress must be a positive number.')
            }

            const level = settings.level != null ? settings.level : 0
            if (settings.progress > settings.thresholds[level]) {
                throw new Error('Achievement progress must be lower than the threshold of the current level.')
            }
        }
    }

    /** Sends an event when this achievement has been unlocked */
    sendUnlockedEvent(name, description, image) {
        metapress.plugins.sendEvent('achievement.unlocked', { id: this._id, name, description, image})
        console.debug(`[Achievement] Unlocked "${name}" ${this._settings.thresholds.length > 1 ? toRoman(this._level) : ''} - ${description}`)
    }

    /**
     * Updates this achievement with the given progress.
     * @param {number} progress Progress amount to update the achievement by.
     */
    update(progress) {
        this.sanityCheck(this._settings)

        // No need to keep tracking if we are already at the highest level
        if (this._hasUnlockedHighest) {
            return
        }

        // Edge case: Progress given is negative
        if (progress < 0) {
            throw new Error('Achievement progress given must be a positive number.')
        }

        // Edge case: Progress given is bigger than highest threshold
        if (progress >= this._settings.thresholds[this._settings.thresholds.length - 1]) {
            this._level = this._settings.thresholds.length - 1
            this._progress = this._settings.thresholds[this._level]
            this._cumulativeProgress = this._settings.thresholds.reduce((a, b) => a + b, 0)

            // Prevent achievement spam when progressing after highest level
            if (!this._hasUnlockedHighest) {
                this._hasUnlockedHighest = true
                this.sendUnlockedEvent(
                    this._settings.names[this._level],
                    this._settings.descriptions[this._level],
                    this._settings.images[this._level]
                )
            }
            return
        }

        const newProgress = this._progress + progress
        if (newProgress >= this._settings.thresholds[this._level]) {

            // Already at highest level
            if (this._level + 1 >= this._settings.thresholds.length) {
                this._progress = this._settings.thresholds[this._level]
                this._cumulativeProgress = this._settings.thresholds.reduce((a, b) => a + b, 0)

                // Prevent achievement spam when progressing after highest level
                if (!this._hasUnlockedHighest) {
                    this._hasUnlockedHighest = true
                    this.sendUnlockedEvent(
                        this._settings.names[this._level],
                        this._settings.descriptions[this._level],
                        this._settings.images[this._level]
                    )
                }
                return
            }

            // Find next level
            let levelsProgressed = []
            let found = false
            for (let idx = this._level + 1; idx < this._settings.thresholds.length; idx++) {
                levelsProgressed.push(idx - 1)

                if (newProgress < this._settings.thresholds[idx]) {
                    this._level = idx
                    found = true
                    break
                }
            }

            if (found) {
                // Level up
                this._progress = Math.max(newProgress - this._settings.thresholds[this._level - 1], 0)
                this._cumulativeProgress = this._settings.thresholds.slice(0, this._level).reduce((a, b) => a + b, 0) + this._progress

                // Send unlocked event for each level unlocked
                let offsets = levelsProgressed.map((_, idx) => idx)
                for (let idx = 0; idx < levelsProgressed.length; idx++) {
                    let level = levelsProgressed[idx]
                    setTimeout(() => {
                        this.sendUnlockedEvent(
                            this._settings.names[level],
                            this._settings.descriptions[level],
                            this._settings.images[level]
                        )
                    }, offsets[idx] * 200)
                }
            }

        } else {

            // Stay at current level
            this._progress = newProgress
            this._cumulativeProgress = this._settings.thresholds.slice(0, this._level).reduce((a, b) => a + b, 0) + newProgress

        }

    }

    /**
     * Resets the achievement.
     * @param {boolean} overall `true` to reset the entire achievement back to the beginning, `false` to reset only the current level.
     */
    reset(overall = false) {
        this.sanityCheck(this._settings)

        if (overall) {
            this._level = 0
            this._progress = 0
            this._cumulativeProgress = 0
        } else {
            this._progress = 0
            this._cumulativeProgress = this._settings.thresholds.slice(0, this._level).reduce((a, b) => a + b, 0)
        }

        this._hasUnlockedHighest = false
    }

    /** Prints the achievement data to the console. */
    print() {
        this.sanityCheck(this._settings)

        const data = {
            id: this._id,
            names: this._settings.names,
            descriptions: this._settings.descriptions,
            thresholds: this._settings.thresholds,
            level: this._level,
            progress: this._progress,
            progressPercent: (this._progress / this._settings.thresholds[this._level]) * 100,
            current: {
                name: this._settings.names[this._level],
                description: this._settings.descriptions[this._level],
                threshold: this._settings.thresholds[this._level]
            }
        }

        console.log('[Achievement]', data)
    }

}
