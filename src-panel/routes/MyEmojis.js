import React from 'react'
import { useStateBridge } from '../components/Hooks'
import { TabBar, TabBarItem } from '../components/SharedUI'
import { useNavigate } from 'react-router-dom'

/** Renders the user's emojis */
export const MyEmojis = props => {

    // Get app state
    const plugin = useStateBridge()

    // Use navigate
    const navigate = useNavigate()

    // Sort collected emojis by date, earliest first
    let collectedEmojis = plugin.state.collectedEmojis || []
    collectedEmojis.sort((a, b) => a.date - b.date)

    // Filter out duplicates in the emoji list
    let allEmojis = plugin.state.emojis || []
    allEmojis = allEmojis.filter((e, i) => allEmojis.indexOf(e) == i)

    // On first run, show help alert
    React.useEffect(() => {

        // Stop if help already shown
        if (localStorage['emojiswap.help_shown']) return
        localStorage['emojiswap.help_shown'] = '1'

        // Show help
        plugin.remoteActions.showAlert(`<div style='font-size: 80px; padding-bottom: 20px; '>👋</div><div>Welcome to Emoji Swap! <br/><br/>This page shows the emojis you've collected so far. You can collect emojis from other people by clicking on them in-world and then selecting Swap Emoji.</div>`, 'Emoji Swap', 'none')

    }, [])

    // Render UI
    return <>

        {/* Tab bar */}
        <TabBar>
            <TabBarItem icon={require('../assets/tab-emojis.svg')} label="My Emojis" selected />
            <TabBarItem icon={require('../assets/tab-leaderboard.svg')} label="Leaderboard" onClick={() => navigate('/leaderboard')} />
        </TabBar>
    
        {/* User's Emoji */}
        <div style={{
            display: 'flex',
            margin: '16px auto',
            width: 106,
            height: 106,
            borderRadius: '50%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            border: "2px solid #2A9ACA",
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 70,
            lineHeight: 0,
        }}>
            {plugin.state.myEmoji}
        </div>
        <div style={{ margin: 5, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', fontSize: 17, fontWeight: 700 }}>My Emoji</div>
            <img src={require('../assets/info.svg')} style={{ width: 16, height: 16, marginLeft: 7, cursor: 'pointer', verticalAlign: 'bottom', marginBottom: 2 }} onClick={() => 
                plugin.remoteActions.showAlert(`<div style='font-size: 80px; padding-bottom: 20px; '>${plugin.state.myEmoji}</div><div>This is your own assigned emoji. Share it with others to increase your score! <br/><br/>You can share it with others by clicking on them in-world and then selecting Swap Emoji.</div>`, 'Emoji Swap', 'none')
            } />
        </div>
        <div style={{ margin: 6, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#34C759' }}>{plugin.state.score ?? '-'} pts</div>

        {/* Emoji container */}
        <div style={{ margin: '20px 6px 10px 6px', textAlign: 'center' }}>

            {/* Each emoji */}
            {allEmojis.map((emoji, i) => 
                <EmojiIcon key={i} emoji={emoji} collected={emoji == plugin.state.myEmoji || collectedEmojis.find(e => e.emoji == emoji)} onClick={() => {

                    // Get info text
                    let emojis = collectedEmojis.filter(e => e.emoji == emoji)
                    let txt = ''
                    if (emojis.length) txt = 'You have collected this emoji from <b>' + emojis.map(e => e.fromName).join(', ') + '</b>.'
                    else if (emoji == plugin.state.myEmoji) txt = 'This is your own assigned emoji. Share it with others to increase your score! <br/><br/>You can share it with others by clicking on them in-world and then selecting Swap Emoji.'
                    else txt = 'To collect this emoji, find the person who has it and then click on them to Swap Emojis.'

                    // Show alert
                    plugin.remoteActions.showAlert(`<div style='font-size: 80px; padding-bottom: 20px; '>${emoji}</div><div>${txt}</div>`, 'Emoji Swap', 'none')

                }} />
            )}

        </div>
    
    </>

}

/** An emoji in the list */
const EmojiIcon = props => {

    // Hovering state
    const [ isHovering, setIsHovering ] = React.useState(false)

    // Render UI
    return <div
        style={{ 
            display: 'inline-block', 
            fontSize: 30, 
            padding: 5, 
            lineHeight: '40px', 
            filter: props.collected ? 'grayscale(0)' : 'grayscale(100%)', 
            opacity: props.collected ? 1 : 0.2,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            transform: isHovering ? 'scale(1.2)' : 'scale(1)',
        }}
        onClick={props.onClick}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
    >
        {props.emoji}
    </div>

}