import Achievement from '../Achievement'

/**
 * Achievement for clicking content in the world.
 */
export default class SiteContentAchievement extends Achievement {

    /**
     * Identifiers of the content items the user has already clicked on.
     *
     * Used to prevent user clicking on the same item multiple times to quickly
     * complete the achievement.
     *
     * @type {string[]}
     */
    clickedContentIds = []

    /**
     * Constructor for the content achievement.
     * @param {object} props Properties for the achievement.
     */
    constructor(props) {
        super(Object.assign({
            names: [ 'Content Consumer', 'Regular Content Consumer', 'Avid Content Consumer', 'Content Consumer Extraordinaire' ],
            descriptions: [ 'Look at your first piece of content.', 'Look at 10 different pieces of content.', 'Look at 50 different pieces of content.', 'Look at 1 000 different pieces of content.' ],
            thresholds: [ 1, 10, 50, 1_000 ],
            images: [
                require('../../images/content-1.png'),
                require('../../images/content-2.png'),
                require('../../images/content-3.png'),
                require('../../images/content-4.png'),
            ]
        }, props))

        window.addEventListener('beforeunload', () => {
            localStorage.setItem('clicked-content', JSON.stringify(this.clickedContentIds))
        })

        // Fetch list of content identifiers that have already been clicked
        this.clickedContentIds = JSON.parse(localStorage.getItem('clicked-content') || '[]')
        if (!Array.isArray(this.clickedContentIds) || this.clickedContentIds.length < 1) {
            this.clickedContentIds = []
        }
    }

    /**
     * Starts monitoring for this achievement.
     * @param {(id: string, progress: number) => void} updateCallback Callback used to update the achievement.
     */
    start(updateCallback) {
        const onClick = data => {
            if (!data) {
                return
            }

            // Already clicked this content item
            if (this.clickedContentIds.includes(data.id)) {
                return
            }

            // Send achievement update
            this.clickedContentIds.push(data.id)
            updateCallback(this.id, 1)
        }

        // Listen for any clicks
        metapress.plugins.addEventListener('siteContent_onClick', onClick)
    }

}
