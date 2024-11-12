import styled from 'styled-components'
import { useContext, useEffect, useState } from 'react'
import { CanvasContext } from '../hooks/CanvasContext'
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';

// Create a way to update the floor name when the Stage is clicked (if there's time)
const UpdateNodeData = () => {
  const { nodes, setNodes, updateNode, setUpdateNode } = useContext(CanvasContext)
  const [node, setNode] = useState()
  const [ nodeData, setNodeData ] = useState()
  const updateNodeName = (e) => {
    // If node name alread exists show an error
    setNode(prevNode => {
      const nodeCopy  ={...prevNode}
      nodeCopy.name = e.target.value
      return nodeCopy
    })
  }

  const updateExitStatus = (e) => {
    e.stopPropagation()
    setNode(prevNode => {
      const nodeCopy = {...prevNode}
      nodeCopy.isExit = !nodeCopy.isExit
      nodeCopy.operation = "update"
      return nodeCopy
    })
  }

  const handleClick = (e) => {
    e.stopPropagation()
    // Keep the error handling here
    if(!node?.name?.length)return
    // Add errors here too
    if(node.name !== nodeData.name && nodes.has(node.name))return
    setNodes(prevState => {
      const nodesCopy = new Map([...prevState])
      if(nodeData.name !== node.name){
        const currentNode = nodesCopy.get(nodeData.name)
        currentNode.name = node.name
        currentNode.operation = "update"
        nodesCopy.delete(nodeData.name)
        nodesCopy.set(node.name, currentNode)
        const connections = nodesCopy.get(node.name).connections
        for(const neighbor of connections){
          for(const connection of nodesCopy.get(neighbor.name).connections){
            if(connection.name === nodeData.name)connection.name = node.name
          }
        }
      }
      if(nodeData.isExit !== node.isExit){
        const currentNode = nodesCopy.get(node.name)
        currentNode.isExit = node.isExit
        currentNode.operation = "update"
        nodesCopy.set(node.name, currentNode)
      }
      return nodesCopy
    })
    setUpdateNode()
  }
  // Add error handling, like "node name can not be empty"
  useEffect(() => {
    if(nodes.has(updateNode)){
      setNode({...nodes.get(updateNode)})
      setNodeData({...nodes.get(updateNode)})
    }
  }, [])

  return (node &&
    <Container onClick={() => setUpdateNode()}>
      <div onClick={e => e.stopPropagation()}>
        <h1>Update Node Data</h1>
        <TextField id="outlined-basic" label="Node Name" variant="outlined" defaultValue={node?.name || ""} onInput={updateNodeName} placeholder={nodeData?.name || ""}/>
        <p onClick={updateExitStatus}>
          Make Node Exit <Checkbox onClick={updateExitStatus} checked={node.isExit} />
        </p>
        <div className='button-container'>
          <button onClick={handleClick}>Update Node</button>
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
      margin-bottom: 1em;
      text-align: center;
    }
    p{
      display: inline-flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 0 1em;
      border-radius: 0.2em;
      &:hover{
        background-color: #d4d3d3;
      }
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

export default UpdateNodeData