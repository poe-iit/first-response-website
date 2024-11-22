import { useState } from 'react'
import TextField from '@mui/material/TextField';
import styled from 'styled-components'

const CreateBuilding = ({ setCreatingBuilding }) => {
  const [name, setName] = useState('')
  const handleClick = (e) => {
    e.stopPropagation()
    setCreatingBuilding(false)
  }
  const createBuilding = (name) => {
    const token = localStorage.getItem('token')
    const buildingData = {
      name
    }
    const query = `
      mutation($buildingData: CreateBuildingInput!) {
        createBuilding(createBuildingInput: $buildingData){
          name
          id
        }
      }
    `

    const variables = {
      buildingData
    }

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    }).then(
      res => res.json()
    ).then(
      res => {
        if(res?.errors) return
      }
    ).catch(
      () => {
        return
      }
    )

    setCreatingBuilding(false)
  }
  return (
    <Container onClick={handleClick}>
      <div onClick={e => e.stopPropagation()}>
        {/* We ask for name of floor here */}
        <h1>Add a floor name</h1>
        <TextField id="outlined-basic" label="Building Name" variant="outlined" onInput={e => setName(e.target.value)} />
        <div className='button-container'>
          <button onClick={() => {
            if(name?.length)createBuilding(name)
          }}>Create Building</button>
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #00000050;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  > div{
    border-radius: 0.3em;
    padding: 1em;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 1em;
    color: #000000;
    width: 30%;
    min-width: 30em;
    h1{
      margin-bottom: 0.4em;
      text-align: center;
    }
    .button-container{
      display: flex;
      justify-content: flex-end;
      button{
        padding: 1em;
        outline: 0;
        border: 0;
        color: #ffffff;
        background-color: #3a3aff;
        width: max-content;
        border-radius: 0.3em;
        cursor: pointer;
      }
    }
  }
`

export default CreateBuilding