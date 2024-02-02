import Achievement from '../Achievement'

export default class JumpAchievement extends Achievement {

    constructor(props) {
        super(Object.assign({
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
                require('../../images/jump-1.svg'),
                require('../../images/jump-2.svg'),
                require('../../images/jump-3.svg'),
                require('../../images/jump-4.svg'),
                require('../../images/jump-5.svg'),
            ]
        }, props))
    }

}
