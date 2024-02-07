import Achievement from '../Achievement'

/**
 * Custom achievement that is used by other plugins.
 */
export default class CustomAchievement extends Achievement {

    /**
     * @private Function to call when we should start monitoring for this achievement.
     * @type {((id: string, progress: number) => void) => void}
     */
    _startFunc = null

    /**
     * @private Function to call when we should stop monitoring for this achievement.
     * @type {((id: string, progress: number) => void) => void}
     */
    _stopFunc = null

    /**
     * Constructor for the custom achievement.
     * @param {object} props Properties for the achievement.
     * @param {((id: string, progress: number) => void) => void} start Function to call when we should start monitoring for this achievement.
     * @param {((id: string, progress: number) => void) => void} stop Function to call when we should stop monitoring for this achievement.
     */
    constructor(props, start = null, stop = null) {
        if (!props.thresholds || !Array.isArray(props.thresholds) || props.thresholds.length < 1) {
            throw new Error('Achievement thresholds must be an array with at least one element.')
        }

        if (props.level != null) {
            if (typeof props.level != 'number') {
                props.level = parseInt(props.level) || 0
            }

            if (props.level < 0) props.level = 0
            if (props.level >= props.thresholds.length) props.level = props.thresholds.length - 1
        }

        if (props.progress != null) {
            if (typeof props.progress != 'number') {
                props.progress = parseInt(props.progress) || 0
            }

            if (props.progress < 0) props.progress = 0

            for (let idx = props.level; idx < props.thresholds.length; idx++) {
                if (props.progress < props.thresholds[idx]) {
                    props.level = idx
                    break
                }

                if (props.progress === props.thresholds[idx]) {
                    let canLevelUp = idx + 1 <= props.thresholds.length - 1
                    props.level = canLevelUp ? idx + 1 : idx
                    props.progress = canLevelUp ? 0 : props.progress
                    break
                }
            }
        }

        super(props)
        this._startFunc = start
        this._stopFunc = stop
    }

    /**
     * Starts monitoring for this achievement.
     * @param {(id: string, progress: number) => void} updateCallback Callback used to update the achievement.
     */
    start(updateCallback) {
        if (!this._startFunc || typeof this._startFunc !== 'function') {
            return
        }

        this._startFunc(updateCallback)
    }

    /** Stops monitoring for this achievement. */
    stop() {
        if (!this._stopFunc || typeof this._stopFunc !== 'function') {
            return
        }

        this._stopFunc()
    }

}
