import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { FormControl, FormHelperText, TextField } from '@mui/material'
import { CanvasContext } from '../hook/CanvasContext'

const EditNodeModal = ({open, setOpen, nodeId}) => {
  const [updatedNodeId, setUpdatedNodeId] = useState("")
  const [error, setError] = useState("")

  const { nodes, setNodes, setPaths } = useContext(CanvasContext)

  const handleInput = (event) => {
    setUpdatedNodeId(event.target.value)
    setError("")
  }

  useEffect(() => {
    console.log(error)
    // get building()
  }, [error])

  const handleClick = () => {
    if(updatedNodeId.length === 0){
      setError("Node must have an id")
      return
    }
    if(updatedNodeId === nodeId){
      setError("Node id cannot be the same")
      return
    }
    if(updatedNodeId in nodes){
      setError("Node id already exists")
      return
    }
    if(updatedNodeId.includes(" ")){
      setError("Node id cannot contain spaces")
      return
    }

    setNodes(prevNodes => {
      const newNodes = {...prevNodes}
      newNodes[updatedNodeId] = prevNodes[nodeId]
      delete newNodes[nodeId]

      for(const key of newNodes[updatedNodeId].connections){
        newNodes[key].connections = newNodes[key].connections.map(con => con === nodeId ? updatedNodeId : con)
      }
      return newNodes
    })

    setPaths(prevPaths => {
      const newPaths = {...prevPaths}
      for(const key in newPaths){
        if(key.includes(nodeId)){
          const newKey = key.replace(nodeId, updatedNodeId)
          newPaths[newKey] = prevPaths[key]
          delete newPaths[key]
        }
      }
      return newPaths
    })

    setOpen(false)
    // Check for errors
    //  Node id may already exist
    //  updated node id may be empty
    // Update node id
    // Update things related to node id like paths, connections
    // Close modal
  }

  useEffect(() => {
    if(!open)setUpdatedNodeId("")
  }, [open])

  return (
    open ? <Container onClick={e => setOpen(false)}>
      <div className='content-container'
        onClick={e => e.stopPropagation()}
      >
        <h3>Update Node Id</h3>
        <FormControl fullWidth>
          <TextField label="Node Id" variant='outlined' disabled value={nodeId}/>
        </FormControl>
        <FormControl fullWidth>
          <TextField label="Updated Node Id" value={updatedNodeId} onInput={handleInput} variant='outlined' error={error?.length !== 0}/> {/* error={!!error.floor}*/}
          {error.length ? <FormHelperText style={{color: "red"}}>{error}</FormHelperText> : null}
        </FormControl>
        <button onClick={handleClick}>Update</button>
      </div>
    </Container> : null
  )
}

export default EditNodeModal

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
    p{
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