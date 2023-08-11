import React from 'react'
import ReactDOM from 'react-dom/client'
import { MyEmojis } from './routes/MyEmojis'
import { HashRouter, Route, RouterProvider, Routes, createHashRouter } from 'react-router-dom'

/** Main app */
const App = () => {

    // Render routes
    return <HashRouter>

        {/* App routes */}
        <Routes>
            <Route path='/my-emojis' element={<MyEmojis />} />
        </Routes>
    
    </HashRouter>

}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />)