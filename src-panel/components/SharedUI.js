import React from 'react'

/**
 * Tab bar
 */
export const TabBar = props => {

    // Render UI
    return <div style={{ position: 'relative', width: '100%', height: 60 }}>

        {/* Bottom bar, underneath the content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 1, backgroundColor: '#373A42' }} />

        {/* Child content */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
            {props.children}
        </div>

    </div>

}

/** 
 * Tab bar item 
 */
export const TabBarItem = props => {

    // Render UI
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        borderBottom: props.selected ? '1px solid white' : '1px solid transparent',
        cursor: 'pointer',
    }} onClick={props.onClick}>

        {/* Icon */}
        <img style={{ height: 16, marginBottom: 8 }} src={props.icon} />

        {/* Label */}
        <div style={{ fontSize: 12, color: props.selected ? '#B3B4B7' : '#707278', fontWeight: props.selected ? 'bold' : 'normal' }}>{props.label}</div>

    </div>

}