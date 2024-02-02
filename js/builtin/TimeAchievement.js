import Achievement from '../Achievement'

export default class TimeAchievement extends Achievement {

    constructor(props) {
        super(Object.assign({
            names: [ 'Time Flies', 'Time Flies Faster', 'Time Flies Fastest', 'Time Flies Too Fast' ],
            descriptions: [ 'Spend 1 minute in the world.', 'Spend 10 minutes in the world.', 'Spend 1 hour in the world.', 'Spend 1 day in the world.' ],
            thresholds: [
                { min: 0, max: 60_000 },
                { min: 60_001, max: 600_000 },
                { min: 600_001, max: 3_600_000 },
                { min: 3_600_001, max: 86_400_000 }
            ],
            images: [
                require('../../images/time-1.svg'),
                require('../../images/time-2.svg'),
                require('../../images/time-3.svg'),
                require('../../images/time-4.svg'),
            ]
        }, props))
    }

}
