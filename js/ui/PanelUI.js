import React from 'react'

/**
 * User interface for showing all achievements and their progress.
 */
export default class PanelUI {

    /** @private Identifier of the sidebar menu item */
    _id = 'achievements.menu'

    /** Constructor for the panel UI */
    constructor(achievements) {
        metapress.entities.add({
            id: this._id,
            type: 'menubar.item',
            name: 'Achievements',
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

    /** All registered achievements */
    get achievements() {
        return this.props.achievements._achievements
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

    /** Render UI */
    render() {
        return <>
        </>
    }

}

class SingleAchievement extends React.PureComponent {

    /** Initial state */
    state = {
        isOpen: false,
    }

    renderOpen() {

    }

    renderClosed(colors) {
        const progressBarWidth = 110

        // Render UI
        return <>
            <img src={this.props.achievement.image} style={{ position: 'relative', top: 0, width: 70, height: 70, flexShrink: 0 }} />

            <div style={{ display: 'flex', position: 'relative', top: 1, width: 110, height: 33, flexShrink: 0, fontSize: 14, WebkitTextStrokeWidth: 1, WebkitTextStrokeColor: 'rgba(0, 0, 0, 0.25)', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                { this.props.achievement.name }
            </div>

            <div style={{ display: 'flex', position: 'relative', top: 7, flexShrink: 0, width: 110, height: 10, border: `1px solid ${colors.tertiary}`, borderRadius: 3, alignItems: 'center' }}>
                <div style={{ flexShrink: 0, width: (this.props.achievement.progressPercent / 100) * progressBarWidth, height: 8, background: colors.secondary, borderRadius: 3, transition: 'width 0.15s ease' }} />

                <div style={{ position: 'absolute', bottom: 0, width: '100%', flexShrink: 0, fontSize: 8, textShadow: '0 0 2px #000000', textAlign: 'center', justifyContent: 'center' }}>
                    { this.props.achievement.progress } / { this.props.achievement.progressMax }
                </div>
            </div>
        </>
    }

    /** Render UI */
    render() {
        const turnImage = this.state.isOpen ? require('../../images/turn-right.svg') : require('../../images/turn-left.svg')
        const colors = this.props.achievement.colors

        // Render UI
        return <div onClick={e => this.setState({ isOpen: !this.state.isOpen })} style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: 130, height: 130, flexShrink: 0, alignItems: 'center', overflow: 'hidden' }}>

            {/* Corner piece */}
            <div style={{ position: 'absolute', top: -35.36, right: 0, width: 50, height: 50, flexShrink: 0, background: colors.tertiary, transform: 'rotate(45deg)', boxShadow: '0 0 3px 0 #000000' }}>
                <div style={{ position: 'absolute', top: this.state.isOpen ? 5 : 4, right: this.state.isOpen ? 5 : 4, flexShrink: 0, background: colors.secondary, width: 12, height: 12, maskImage: `url(${turnImage})`, maskPosition: 'center', maskSize: 'cover', maskRepeat: 'no-repeat', WebkitMaskImage: `url(${turnImage})`, WebkitMaskPosition: 'center', WebkitMaskSize: 'cover', WebkitMaskRepeat: 'no-repeat' }} />
            </div>

            {/* Render specific state of achievement */}
            { this.state.isOpen
                ? this.renderOpen(colors)
                : this.renderClosed(colors)
            }

        </div>
    }

}
