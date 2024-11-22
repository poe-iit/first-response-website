import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Delete from '@mui/icons-material/Delete'

const Floor = ({name, id, setBuildings}) => {
  const deleteFloor = () => {
    const token = localStorage.getItem("token")
    const query =`
      mutation{
        createFloor(createFloorInput: {id: "${id}", name: "${name}", isDeleted: true}){
          name
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
    ).then(res => {
      if(res?.data?.updateFloor === null){
        setBuildings(prevState => {
          const arr = []
          for(const building of prevState){
            const floors = []
            for(const floor of building.floors){
              if(floor.id === id)continue
              else floors.push(floor)
            }
            building.floors = floors
            arr.push(building)
          }
          return arr
        })
      }
    }).catch(
      err => {
        console.log(err)
      }
    )
  }
  return (
    <Container>
      <Link to={`/floor/${id}`}>
        {name}
      </Link>
      <Delete sx={{
        fontSize: "1.3em"
      }} onClick={deleteFloor}/>
    </Container>
  )
}

const Container = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  border-radius: 0.3em;
  cursor: pointer;
  &:hover{
    background-color: #00000010;
  }
  a{
    text-decoration: none;
    color: #3a3aff;
    font-size: 1em;
    flex: 1;
  }
  svg{
    margin-left: 1em;
    fill: #d45d5d;
    cursor: pointer;
  }
`

export default Floor