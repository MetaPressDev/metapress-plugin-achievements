import Achievement from '../Achievement'

/**
 * Achievement for spending time in the world.
 */
export default class TimeAchievement extends Achievement {

    /** Timer used to push updates to achievement manager */
    _updateTimer = null

    /** Interval between updates, in milliseconds */
    _timeInterval = 250

    /**
     * Constructor for the time achievement.
     * @param {object} props Properties for the achievement.
     */
    constructor(props) {
        super(Object.assign({
            names: [ 'Time Flies', 'Time Flies Faster', 'Time Flies Fastest', 'Time Flies Too Fast' ],
            descriptions: [ 'Spend 1 minute in the world.', 'Spend 10 minutes in the world.', 'Spend 1 hour in the world.', 'Spend 1 day in the world.' ],
            thresholds: [ 60_000, 600_000, 3_600_000, 86_400_000 ],
            images: [
                require('../../images/time-1.png'),
                require('../../images/time-2.png'),
                require('../../images/time-3.png'),
                require('../../images/time-4.png'),
            ]
        }, props))
    }

    /**
     * Starts monitoring for this achievement.
     * @param {(id: string, progress: number) => void} updateCallback Callback used to update the achievement.
     */
    start(updateCallback) {
        if (this._updateTimer) {
            clearInterval(this._updateTimer)
        }

        // Update time on a regular basis
        this._timeTimer = setInterval(() => {
            updateCallback(this.id, this._timeInterval, process.env.SIGN)
        }, this._timeInterval)
    }

}
