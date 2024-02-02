import Achievement from '../Achievement'

export default class MoveAchievement extends Achievement {

    constructor(props) {
        super(Object.assign({
            names: [ "Learn to Move", "Let's Get Moving", "Now We're Moving", "Movement Pro", "Movement Master" ],
            descriptions: [ 'Move 1 metre.', 'Move 50 metres.', 'Move 1 000 metres.', 'Move 50 000 metres.', 'Move 1 000 000 metres.' ],
            thresholds: [
                { min: 0, max: 1 },
                { min: 2, max: 50 },
                { min: 51, max: 1_000 },
                { min: 1_001, max: 50_000 },
                { min: 50_001, max: 1_000_000 }
            ],
            images: [
                require('../../images/move-1.svg'),
                require('../../images/move-2.svg'),
                require('../../images/move-3.svg'),
                require('../../images/move-4.svg'),
                require('../../images/move-5.svg'),
            ]
        }, props))
    }

    start() {

    }

}
