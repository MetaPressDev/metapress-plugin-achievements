import { v4 as uuidv4 } from 'uuid'

/**
 * A single achievement that can have a single level or multiple levels.
 */
export default class Achievement {

    /** @private Level of the current achievement */
    _level = 0

    /** @private Progress in the current achievement level */
    _progress = 0

    /** @private Overall progress throughout all achievement levels */
    _overallProgress = 0

    /** @private Settings applied to this achievement */
    _settings = {}

    /** Identifier for this achievement */
    id = ''

    /**
     * Constructor for a single achievement.
     * @param {object} settings Achievement settings.
     * @param {string[]} settings.names Names for each level of the achievement.
     * @param {string[]} settings.descriptions Descriptions for each level of the achievement.
     * @param {{ min: number, max: number }[]} settings.thresholds Minimum and maximum values that denote the range of each level. Each minimum value needs to be higher than the maximum of the previous level.
     * @param {number=} settings.level Optional. Current level of the achievement. Default is 0.
     * @param {number=} settings.progress Optional. Current progress of the achievement in the current level. Must be irrespective of the minimum value of the level (e.g. if level is between 100 and 150, progress should be between 0 and 50). Default is 0.
     */
    constructor(settings = {}) {
        this.sanityCheck(settings)

        // Assign values
        this.id = uuidv4()
        this._settings = settings
        this._level = settings.level || 0
        this._progress = settings.progress || 0
        this._overallProgress = settings.thresholds[this._level].min + this._progress
    }

    /** Level of the current achievement */
    get level() {
        return this._level
    }

    set level(lvl) {
        throw new Error('Not allowed to set achievement level.')
    }

    /** Progress in the current achievement level */
    get progress() {
        return this._progress
    }

    set progress(prog) {
        throw new Error('Not allowed to set achievement progress.')
    }

    /** Overall progress throughout all achievement levels */
    get overallProgress() {
        return this._overallProgress
    }

    set overallProgress(prog) {
        throw new Error('Not allowed to set overall achievement progress.')
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

        if (settings.names.length != settings.descriptions.length || settings.names.length != settings.thresholds.length) {
            throw new Error('Achievement names, descriptions, and thresholds must have the same number of elements.')
        }

        for (let i = 0; i < settings.thresholds.length; i++) {
            if (settings.thresholds[i].min == null || settings.thresholds[i].max == null || settings.thresholds[i].min >= settings.thresholds[i].max) {
                throw new Error('Achievement thresholds must have a minimum and maximum value, and the minimum must be lower than the maximum.')
            }

            if (i > 0) {
                if (settings.thresholds[i].min <= settings.thresholds[i - 1].max) {
                    throw new Error('Achievement thresholds must have a minimum value higher than the maximum of the previous level.')
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
            const min = settings.thresholds[level].min
            const max = settings.thresholds[level].max

            if (settings.progress + min >= max) {
                throw new Error('Achievement progress must be lower than the maximum value of the current level.')
            }
        }
    }

    /**
     * Updates this achievement with the given progress.
     * @param {number} progress Progress amount to update the achievement by.
     */
    update(progress) {
        this.sanityCheck(this._settings)

        // Edge case: Progress given is negative
        if (progress < 0) {
            throw new Error('Achievement progress given must be a positive number.')
        }

        // Edge case: Progress given is bigger than highest threshold
        if (progress >= this._settings.thresholds[this._settings.thresholds.length - 1].max) {
            this._level = this._settings.thresholds.length - 1
            this._progress = this._settings.thresholds[this._level].max - this._settings.thresholds[this._level].min
            this._overallProgress = this._settings.thresholds[this._level].max
            return
        }

        const newProgress = this._progress + progress
        if (newProgress >= this._settings.thresholds[this._level].max - this._settings.thresholds[this._level].min) {

            // Already at highest level
            if (this._level + 1 >= this._settings.thresholds.length) {
                this._progress = this._settings.thresholds[this._level].max - this._settings.thresholds[this._level].min
                this._overallProgress = this._settings.thresholds[this._level].max
                return
            }

            // Level up
            this._level += 1
            this._progress = Math.max(newProgress - this._settings.thresholds[this._level].min, 0)
            this._overallProgress = this._settings.thresholds[this._level].min + this._progress

        } else {

            // Stay at current level
            this._progress = newProgress
            this._overallProgress = this._settings.thresholds[this._level].min + this._progress

        }

    }

    /** Prints the achievement data to the console. */
    print() {
        this.sanityCheck(this._settings)

        const data = {
            id: this.id,
            names: this._settings.names,
            descriptions: this._settings.descriptions,
            thresholds: this._settings.thresholds,
            level: this._level,
            progress: this._progress,
            progressPercent: (this._progress / (this._settings.thresholds[this._level].max - this._settings.thresholds[this._level].min)) * 100,
            overallProgress: this._overallProgress,
            current: {
                name: this._settings.names[this._level],
                description: this._settings.descriptions[this._level],
                threshold: this._settings.thresholds[this._level]
            }
        }

        console.log('[Achievement]', data)
    }

}
