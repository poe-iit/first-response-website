import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { CanvasContext } from '../hook/CanvasContext'

const serverURL = import.meta.env.VITE_SERVER_URL
const PublishFloor = ({open, setOpen, buildings}) => {
  const [building, setBuilding] = useState("")
  const [floor, setFloor] = useState("")
  const [error, setError] = useState({
    floor: "",
    building: "",
  })

  const { nodes, setNodes, paths } = useContext(CanvasContext)

  const handleChange = (event) => {
    setBuilding(event.target.value);
    setError({
      ...error,
      building: ""
    })
  }
  const handleInput = (event) => {
    setFloor(event.target.value);
    setError({
      ...error,
      floor: ""
    })
  }

  useEffect(() => {
    console.log(error)
    // get building()
  }, [error])

  const handleClick = () => {
    const replace = {}
    if(!floor || floor.length === 0) {
      replace.floor = "Floor name is required"
    }
    if(!building || building.length === 0) {
      replace.building ="Building is required"
    }
    console.log(serverURL)
    setError({
      ...error,
      ...replace
    })
    if(replace.floor || replace.building) return

    fetch(`${serverURL}/floor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: floor,
        building,
        nodes,
        paths
      })
    }).then(res => res.json())
    .then(data => {
      console.log(data)
      setNodes({})
      setOpen(false)
    }).catch(err => console.log("Error Here: ", err))
  }

  useEffect(() => {
    console.log(buildings)
  }, [buildings])
  return (
    open ? <Container onClick={e => setOpen(false)}>
      <div className='content-container'
        onClick={e => e.stopPropagation()}
      >
        <h3>Publish Floor</h3>
        <FormControl fullWidth>
          <TextField label="Floor Name" value={floor} onInput={handleInput} variant='outlined' error={!!error.floor} />
          <FormHelperText>{error.floor}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Building</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={building}
            label="Building"
            onChange={handleChange}
            error={!!error.building}
          >
            {
              buildings.map((building, i) => <MenuItem key={i} value={building._id}>{building.name}</MenuItem>)
            }
          </Select>
          <FormHelperText>{error.building}</FormHelperText>
        </FormControl>
        <button onClick={handleClick}>Publish</button>
      </div>
    </Container> : null
  )
}

export default PublishFloor

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  .content-container{
    border: 2px solid gray;
    border-radius: 5px;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
    background-color: white;
    padding: 2em;
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    > p{
      margin: 0;
    }
    h3{
      margin-bottom: 0.5em;
    }
    > div{
      margin-bottom: 1em;
    }
    button{
      width: 100%;
      border-radius: 100px;
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border: 0;
      padding: 0.6em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 24px;
      font-size: 0.85em;
      font-weight: 500;
      &:hover{
        filter: brightness(90%);
      }
    }
  }
`