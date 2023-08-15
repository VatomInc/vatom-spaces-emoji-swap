import React from 'react'
import ReactDOM from 'react-dom/client'
import { MyEmojis } from './routes/MyEmojis'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Leaderboard } from './routes/Leaderboard'

/** Main app */
const App = () => {

    // Render routes
    return <HashRouter>

        {/* App routes */}
        <Routes>
            <Route path='/my-emojis' element={<MyEmojis />} />
            <Route path='/leaderboard' element={<Leaderboard />} />
        </Routes>
    
    </HashRouter>

}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />)