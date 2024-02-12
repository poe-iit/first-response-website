import { useContext, useEffect, useState } from "react"
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from "@mui/icons-material/Google"
import { AuthContext } from "../hook/AuthContext";
import { GithubAuthProvider, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'
import ErrorBlob from "../components/ErrorBlob";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("login-email") || '')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const [errorBlob, setErrorBlob] = useState()

  const { setUser, setLoading, setUserData, userData, auth, user, db } = useContext(AuthContext)

  const handleError = (errorCode) => {
    switch(errorCode){
      case "auth/account-exists-with-different-credential":
        setErrorBlob({
          title: "Wrong Credentials",
          message: "Your account was created with a different login method. Please use that login method to sign in."
        })
        break
      case "auth/invalid-email":
        setErrorBlob({
          title: "Invalid Email",
          message: "Please enter a valid email address."
        })
        break
      case "auth/user-disabled":
        setErrorBlob({
          title: "Account Disabled",
          message: "Your account has been disabled. Please contact support."
        })
        break
      case "auth/user-not-found":
        setErrorBlob({
          title: "Account Not Found",
          message: "Your account was not found. Please sign up."
        })
        break
      case "auth/too-many-requests":
        setErrorBlob({
          title: "Too Many Requests",
          message: "Too many failed login attempts. Please try again later."
        })
        break
      case "auth/popup-closed-by-user":
        setErrorBlob({
          title: "Popup Closed",
          message: "The popup has been closed. Please try again."
        })
        break
      case "auth/popup-blocked":
        setErrorBlob({
          title: "Popup Blocked",
          message: "The popup has been blocked. Please unblock it and try again."
        })
        break
      case "auth/network-request-failed":
        setErrorBlob({
          title: "Network Error",
          message: "Network request failed. Please try again."
        })
        break
      default:
        setErrorBlob({
          title: "Invalid Credentials",
          message: "Incorrect email address and / or password. If your account was created with a different login method, please use that method to sign in. You can then link your account through the account settings."
        })
        break
    }
  }

  const handleLogin = async (state) => {
    if(state === "normal"){
      console.log(auth, "Working", email, password)
      if(!auth)return
      setLoading(true)
      const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
      if(!regex.test(email) || password.length === 0){
        handleError("Invalid email")
        setLoading(false)
        return
      }
      await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential)
        setUser(userCredential.user)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.log(error)
        handleError(error.code)
        setLoading(false)
      })
      setLoading(false)
    }else{
      let provider
      if(state === "github"){
        provider = new GithubAuthProvider();
      }else if(state === "google"){
        provider = new GoogleAuthProvider();
      }else if(state === "facebook"){
        provider = new FacebookAuthProvider();
      }

      if(provider){
        setLoading(true)
        localStorage.setItem("login-method", state)
        signInWithRedirect(auth, provider)
        // .then((result) => {
        //   // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        //   // const credential = GithubAuthProvider.credentialFromResult(result);
        //   // const token = credential.accessToken;
        //   // console.log(result, credential)
      
        //   // The signed-in user info.
        //   setUser(result.user);
        //   setLoading(false)
        // }).catch((error) => {
        //   // The AuthCredential type that was used.
        //   // const credential = GithubAuthProvider.credentialFromError(error);
        //   // console.error(error, credential)
        //   handleError(error.code)
        //   setLoading(false)
        // });
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if(user)navigate("/")
  }, [])

  useEffect(() => {
    const handleEnter = (e) => {
      if(e.key === "Enter" && auth){
        setLoading(true)
        const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if(!regex.test(email) || password.length === 0){
          handleError("Invalid email")
          setLoading(false)
          return
        }
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential)
          setUser(userCredential.user)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error Code:", error.code);
          console.error("Error Message:", error.message);
          console.error(error)
          handleError(error.code)
          setLoading(false)
        })
        setLoading(false)
      }
    }
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [auth, email, password])

  useEffect(() => {
    localStorage.setItem("login-email", email)
  }, [email])

  useEffect(() => {
    if(user){
      (async () => {
        const userRef = doc(db, "users", user.uid)
        getDoc(userRef)
        .then(async docSnap => {
          if(!docSnap.exists()){
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
              newUser: true
            })
            setUserData({
              ...userData,
              newUser: true
            })
          }
      })
      })()
      navigate("/")
    }
  }, [user])

  useEffect(() => {
    if(!auth)return
    if(localStorage["login-method"]){
      delete localStorage["login-method"]
      getRedirectResult(auth)
      .then((result) => {
        setUser(result.user)
        setLoading(false)
      })
      .catch((error) => {
        handleError(error.code)
        setLoading(false)
      })
    }
  }, [auth])

  // Add errors, make apple work
  return (
    <Container>
      <div className='content-container'>
        <h3>Log In</h3>
        {errorBlob?.title && <ErrorBlob {...errorBlob} />}
        <ul>
          <li>
            <p>Email/Username</p>
            <input type='text' placeholder='Type here' value={email} onInput={(e) => {
              if(errorBlob)setErrorBlob()
              setEmail(e.target.value)}
            } />
          </li>
          <li>
            <p>Password</p>
            <input type='password' placeholder='Type here' value={password} onInput={(e) => {
              if(errorBlob)setErrorBlob()
              setPassword(e.target.value)}
            } />
          </li>
        </ul>
        <button onClick={() => handleLogin("normal")}>Log In</button>
        <div className='divider'></div>
        <div className='external-login'>
          <button className='github' onClick={() => handleLogin("github")}><GitHubIcon />Log In with GitHub</button>
          <button className='google' onClick={() => handleLogin("google")}><GoogleIcon />Log In with Google</button>
          <button className='facebook' onClick={() => handleLogin("facebook")}><FacebookIcon />Log In with Facebook</button>
        </div>
        <p className='signup-redirect'>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
      </div>
    </Container>
  )
}

export default Login

const Container = styled.div`
  padding: 1em 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  .content-container {
    width: 500px;
    padding: 0 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1em;
    h3{
      font-weight: 800;
      line-height: 20px;
      font-size: 2em;
      text-align: center;
      color: var(--md-sys-color-on-background);
      padding-bottom: 0.5em;
    }
    ul{
      display: flex;
      flex-direction: column;
      gap: 1em;
      width: 100%;
      li{
        p{
          font-size: 14px;
          line-height: 1.5em;
          color: var(--md-sys-color-on-background);
        }
        input{
          padding: 16px;
          border: 1px solid #CCC;
          border-radius: 8px;
          width: 100%;
          outline: 0;
          &:focus-within, &:focus-visible{
            outline:2px solid var(--md-sys-color-primary);
            border-color: transparent;
          }
        }
      }
    }
    button{
      width: 100%;
      border-radius: 100px;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: 0;
      padding: 0.6em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 24px;
      font-size: 0.85em;
      &:hover{
        filter: brightness(90%);
      }
    }
    .divider{
      height: 0;
      width: 100%;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .external-login{
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.7em;
      button{
        & > svg{
          fill:  var(--md-sys-color-on-secondary-container);
        }
        &:hover{
          filter: brightness(90%)
        }
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
      }
    }
    .signup-redirect{
      color: var(--md-sys-color-on-background);
      a{
        color: var(--md-sys-color-primary);
        text-decoration: none;
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }
  @media screen and (max-width: 700px) {
    .content-container{
      padding: 0 20px;
    }
  }
`