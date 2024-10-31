import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Floor from './Floor'

const Building = ({
  name, id, floors, setBuildings
}) => {
  return (
    <Container>
      <Link to={`/building/${id}`}>{name}</Link>
      <ul>
        {
          floors?.length ? floors.map((floor, key) => <Floor key={key} name={floor.name} id={floor.id} setBuildings={setBuildings} /> ): <></>
        }
      </ul>
      <Link to={`/building/${id}/new`} className='new-floor'>Create a new Floor</Link>
    </Container>
  )
}

const Container = styled.li`
  ul{
    list-style: none;
    padding-left: 1em;
  }
`

export default Building