import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Login from './component/Login'
// import './App.css'
import User from './component/User'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Login></Login>
      {/* <User></User> */}
    </>
  )
}

export default App
