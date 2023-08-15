import React from 'react'
import { useStateBridge } from '../components/Hooks'
import { useNavigate } from 'react-router-dom'
import { TabBar, TabBarItem } from '../components/SharedUI'

/** Renders the leaderboard */
export const Leaderboard = props => {

    // Get app state
    const plugin = useStateBridge()

    // Use navigate
    const navigate = useNavigate()

    // Render UI
    return <>

        {/* Tab bar */}
        <TabBar>
            <TabBarItem icon={require('../assets/tab-emojis.svg')} label="My Emojis" onClick={() => navigate('/my-emojis')} />
            <TabBarItem icon={require('../assets/tab-leaderboard.svg')} label="Leaderboard" selected/>
        </TabBar>

        {/* Top three area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '20px 0px' }}>

            {/* Second place */}
            <LeaderboardTopIcon icon='🥈' size={60} image='' points={2} />

            {/* First place */}
            <LeaderboardTopIcon icon='🏆' size={100} image='' points={1} />

            {/* Third place */}
            <LeaderboardTopIcon icon='🥉' size={60} image='' points={3} />

        </div>

        {/* Leaderboard items */}
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
        <LeaderboardItemRow title="Test User" subtitle="@testuser" extra="12 pts" />
    
    </>

}

/** Emoji leaderboard icon */
const LeaderboardTopIcon = props => {

    // Render UI
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* Top icon */}
        <div style={{ fontSize: 20, marginBottom: 8 }}>{props.icon}</div>

        {/* User icon */}
        <div style={{ position: 'relative', width: props.size || 100, height: props.size || 100, boxSizing: 'border-box', borderRadius: '50%', overflow: 'hidden', border: '2px solid #2A9ACA' }}>
            <div style={{ 
                position: 'absolute', 
                top: 2, left: 2, 
                width: 'calc(100% - 4px)', height: 'calc(100% - 4px)',
                borderRadius: '50%', 
                overflow: 'hidden',  
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                backgroundImage: 'url(' + props.image + ')',
                backgroundPosition: 'center',
                backgroundSize: 'cover'
            }} />
        </div>

        {/* Points */}
        <div style={{ margin: 6, textAlign: 'center', fontSize: 16, color: '#34C759' }}>{props.points} pts</div>

    </div>

}

/** Leaderboard item row */
const LeaderboardItemRow = props => {

    // Render UI
    return <div style={{ display: 'flex', height: 64, margin: '0px 10px', alignItems: 'center' }}>

        {/* User icon */}
        <div style={{ 
            width: 48, height: 48,
            borderRadius: '50%', 
            overflow: 'hidden',  
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            backgroundImage: 'url(' + props.image + ')',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            flex: '0 0 auto',
            marginLeft: 10,
        }} />

        {/* Text section */}
        <div style={{ margin: 8, flex: '1 1 1px' }}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#D9D9DB', fontSize: 15, fontWeight: '700' }}>{props.title}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#707278', fontSize: 13, marginTop: 2 }}>{props.subtitle}</div>
        </div>

        {/* Points section */}
        <div style={{ marginRight: 16, flex: '0 0 auto', color: '#B3B4B7', fontSize: 15, fontWeight: '400' }}>{props.extra}</div>

    </div>

}