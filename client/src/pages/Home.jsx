import { useContext, useEffect } from "react"
import { AuthContext } from "../hook/AuthContext"
import { signOut } from "firebase/auth"

const Home = () => {
  const { auth, user } = useContext(AuthContext)
  const onSignOut = () => {
    signOut(auth)
  }
  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  )
}

export default Home