import React from 'react'

/**
 * User interface for showing all achievements and their progress.
 */
export default class PanelUI {

    /** @private Identifier of the sidebar menu item */
    _id = 'achievements.menu'

    /** Constructor for the panel UI */
    constructor(achievements) {
        this._init(achievements)
    }

    /** Initialize panel UI */
    _init(achievements) {
        if (!metapress?.entities) {
            setTimeout(() => this._init(achievements), 1000)
        }

        // Add achievements
        metapress.entities.add({
            id: this._id,
            type: 'menubar.item',
            name: 'Achievements',
            order: 2,
            icon: require('../../images/icon.svg'),
            onClick: () => this.toggleUI(achievements)
        })
    }

    /** Toggles the achievements menu UI */
    toggleUI(achievements) {
        metapress.menubar.toggleReactPanel(this._id, () => <AchievementsMenu achievements={achievements} />)
    }

}

/**
 * Achievements menu component, showing all achievements and progress.
 */
class AchievementsMenu extends React.PureComponent {

    /** @private Timer used to update the UI on a regular basis */
    _updateTimer = null

    /** Initial state */
    state = {

    }

    /** Called after first render */
    componentDidMount() {
        this._updateTimer = setInterval(this.refresh, 1000)
    }

    /** Called before component is unloaded */
    componentWillUnmount() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer)
        }

        this._updateTimer = null
    }

    /** Refreshes the UI */
    refresh = () => {
        this.forceUpdate()
    }

    /** @returns All registered achievements */
    getAchievements() {
        return this.props.achievements._achievements
    }

    /** Render UI */
    render() {
        const achievements = this.getAchievements()

        // Render UI
        return <PanelContainer title='Achievements'>

            {/* Information text */}
            <div style={{ flexShrink: 0, margin: '20px 30px', fontSize: 13, color: '#FFFFFF', fontWeight: 300, textAlign: 'center' }}>
                Earn achievements by completing various activities within the world. Click on each achievement to learn more.
            </div>

            {/* Achievements */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 35, justifyContent: 'center', alignItems: 'center' }}>
                { achievements.map(achievement => <SingleAchievement key={achievement.id} achievement={achievement} />) }
            </div>

        </PanelContainer>
    }

}

/**
 * Represents a single achievement.
 */
class SingleAchievement extends React.Component {

    /** Initial state */
    state = {
        isOpen: false,
    }

    /** Formats the given number into a more readable format */
    formatNumber(num) {
        num = parseInt(num)

        // Use "en-us" since it uses a comma separator
        return Intl.NumberFormat('en-us').format(num).replace(/,/g, ' ')
    }

    /** Renders more information about the current achievement */
    renderOpen() {
        return <>
        </>
    }

    /** Renders most important information about achievement */
    renderClosed(colors) {
        const contentWidth = 120

        // Render UI
        return <>
            {/* Icon */}
            <img src={this.props.achievement.image} style={{ position: 'relative', top: 0, width: 70, height: 70, flexShrink: 0 }} />

            {/* Name of achievement level */}
            <p style={{ display: '-webkit-box', margin: '2px 0 0 0', padding: 0, width: contentWidth, height: 44, flexShrink: 0, fontSize: 14, textAlign: 'center', textShadow: '0 0 2px #000000', WebkitLineClamp: 2, WebkitBoxOrient: 'horizontal', WebkitBoxAlign: 'center', WebkitBoxPack: 'center', overflow: 'hidden' }}>
                { this.props.achievement.name }
            </p>

            {/* Progress */}
            <div style={{ display: 'flex', position: 'relative', marginTop: 7, flexShrink: 0, width: contentWidth, height: 14, border: `1px solid ${colors.tertiary}`, borderRadius: 3, alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ flexShrink: 0, width: (this.props.achievement.progressPercent / 100) * contentWidth, height: '100%', background: colors.primary, transition: 'width 0.15s ease' }} />

                <div style={{ position: 'absolute', bottom: 0, width: '100%', flexShrink: 0, fontSize: 8, textShadow: '0 0 2px #000000', textAlign: 'center', justifyContent: 'center' }}>
                    { this.formatNumber(this.props.achievement.progress) } / { this.formatNumber(this.props.achievement.progressMax) }
                </div>
            </div>
        </>
    }

    /** Render UI */
    render() {
        const turnImage = this.state.isOpen ? require('../../images/turn-left.svg') : require('../../images/turn-right.svg')
        const colors = this.props.achievement.colors

        // Render UI
        return <div onClick={e => this.setState({ isOpen: !this.state.isOpen })} style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: 150, height: 150, flexShrink: 0, borderRadius: 8, background: colors.secondary, boxShadow: `0 4px 0 0 ${colors.tertiary}`, alignItems: 'center', overflow: 'hidden', cursor: 'pointer' }}>

            {/* Corner piece */}
            <div style={{ position: 'absolute', top: -25, right: -25, width: 50, height: 50, flexShrink: 0, background: colors.tertiary, transform: 'rotate(45deg)', boxShadow: '0 0 3px 0 #000000' }}>
                <div style={{ position: 'absolute', bottom: 3, left: 18, flexShrink: 0, background: colors.secondary, width: 12, height: 12, transform: 'rotate(-45deg)', maskImage: `url(${turnImage})`, maskPosition: 'center', maskSize: 'cover', maskRepeat: 'no-repeat', WebkitMaskImage: `url(${turnImage})`, WebkitMaskPosition: 'center', WebkitMaskSize: 'cover', WebkitMaskRepeat: 'no-repeat' }} />
            </div>

            {/* Render specific state of achievement */}
            { this.state.isOpen
                ? this.renderOpen(colors)
                : this.renderClosed(colors)
            }

        </div>
    }

}

/**
 * Container for a panel.
 * @param {object} props Panel container properties.
 * @param {string} props.title Title of the panel.
 * @param {React.ReactNode} props.children Children of the panel.
 */
const PanelContainer = props => {
    return <>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 0, left: 0, width: '100%', height: 44, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>

            {/* Title */}
            <div style={{ fontSize: 15, margin: '0px 20px', flex: '1 1 1px' }}>
                { props.title }
            </div>

            {/* Close button */}
            <img draggable='false' src={require('../../images/close.svg')} title='Close' style={{ width: 20, height: 20, marginRight: 15, cursor: 'pointer' }} onClick={e => metapress.menubar.closePanel()} />

        </div>

        {/* Scrollable content */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 45, left: 0, width: '100%', height: 'calc(100% - 45px)', overflowX: 'hidden', overflowY: 'auto', alignItems: 'center' }}>
            { props.children }
        </div>
    </>
}
