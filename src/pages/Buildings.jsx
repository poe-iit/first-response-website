import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Building from '../components/Building'
import { Link } from 'react-router-dom'

const Buildings = () => {
  const [buildings, setBuildings] = useState([])
  const getBuildings = () => {
    const token = localStorage.getItem("token")
    const query = `
      query {
        getBuildings{
          id
          name
          floors{
            id
            name
          }
        }
      }
    `
    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ query })
    }).then(
      res => res.json()
    ).then(
      res => {
        if("getBuildings" in res?.data){
          setBuildings(res.data.getBuildings)
        }
      }
    ).catch(
      err => {
        console.log(err)
      }
    )
  }

  useEffect(() => {
    getBuildings()
  }, [])
  return (
    // Add option to delete floors and buildings
    <Container>
      <h3>This definitely needs to be redesigned</h3>
      <p>I'm just dumping things here because I need the links</p>
      <ul>
        {
          buildings.map((building, key) => <Building key={key} id={building?.id} name={building?.name} floors={building?.floors} setBuildings={setBuildings} />)
        }
      </ul>
      <Link to="/building/new" className='new-building'>Create a new Building</Link>
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  > ul{
    list-style: none;
    padding: 0 0 1em 1em;
    li {
      width: max-content;
      a:not(.new-floor){
        padding: 0.5em;
        text-decoration: none;
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }

  a{
    display: block;
    color: #0000ee;
  }

  .new-building, .new-floor{
    margin-left: 1em;
    text-decoration: none;
    color: white;
    background-color: #3a3aff;
    padding: 0.5em;
    border-radius: 0.5em;
    width: max-content;
  }
`

export default Buildings