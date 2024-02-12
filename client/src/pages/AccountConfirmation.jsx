import styled from 'styled-components'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../hook/AuthContext'
import { useNavigate } from 'react-router-dom'
import { updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { deleteUser} from "firebase/auth"

const AccountConfirmation = () => {
  const { userData, user, auth, db } = useContext(AuthContext)
  const navigate = useNavigate()
  useEffect(() => {
    if(!userData || !userData.newUser)navigate("/")
  }, [])
  const handleAccountConfirmation = async () => {
    await updateDoc(doc(db, "users", user.uid), {newUser: false})
    navigate("/")
  }
  const handleAccountDeletion = async () => {
    await deleteDoc(doc(db, "users", user.uid))
    await deleteUser(auth.currentUser)
    navigate("/")
  }
  return (
    <Container>
      <h1>Looks like it's your first time here</h1>
      <p>Do you want to create a new account with the email? {userData.email}</p>
      <div className='buttons'>
      <button onClick={handleAccountConfirmation}>Create an account</button>
      <button className='secondary' onClick={handleAccountDeletion}>Nevermind</button>
      </div>
    </Container>
  )
}

export default AccountConfirmation

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200px;
  gap: 2em;
  h1{
    width: max-content
  }
  p{
    width: max-content;
  }
  .buttons{
    display: flex;
    flex-direction: row;
    gap: 3em;
    button{
      width: 250px;
      max-width: 360px;
      border-radius: 100px;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: 0;
      padding: 0.4em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 24px;
      font-size: 0.85em;
      &:hover{
        filter: brightness(90%);
      }
      &.secondary{
        background-color: var(--md-sys-color-secondary);
        color: var(--md-sys-color-on-secondary);
      }
    }
  }
  @media screen and (max-width: 700px) {
    gap: 1em;
    padding-left: 1em;
    padding-right: 1em;
    h1, p{
      width: 100%;
      text-align: center;
    }
    .buttons{
      flex-direction: column;
      gap: 0.5em;
      width: 100%;
      align-items: center;
      button{
        width: 100%
      }
    }
  }
`