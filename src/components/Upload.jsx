
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CanvasContext } from '../hooks/CanvasContext'
import TextField from '@mui/material/TextField';
import { useParams, useNavigate } from 'react-router-dom';

const Upload = () => {
  const { floorId, setFloorId, nodes, setNodes, connections, setConnections, setPrevSelectedNode, setUpload} = useContext(CanvasContext)

  const { buildingId } = useParams()

  const [floorName, setFloorNmae] = useState("")

  const navigate = useNavigate()

  const uploadPlan = () => {
    const createConnections = []
    const updateConnections = []

    const tempConnections = JSON.parse(JSON.stringify(connections))

    for(const connection of tempConnections){
      if("operation" in connection){
        const connectedNodes = connection.connectedNodes
        const connections = []
        if(connectedNodes[0].id) connections.push({ id: connectedNodes[0].id })
        else connections.push({ name: connectedNodes[0].name })
        if(connectedNodes[1].id) connections.push({ id: connectedNodes[1].id })
        else connections.push({ name: connectedNodes[1].name })
        delete connection.connectedNodes
        connection.connections = connections
        if(connection.operation === "create") createConnections.push(connection)
        else if(connection.operation === "update" || connection.operation === "delete") updateConnections.push(connection)

        if(connection.operation === "delete")connection.isDeleted = true
        delete connection.operation
      }
    }

    const createNodes = []
    const updateNodes = []

    for(const [_, node] of nodes){
      if(node.operation === "create") createNodes.push(node)
      else if(node.operation === "update" || node.operation === "delete") updateNodes.push(node)

      if(node.operation === "delete")node.isDeleted = true
      delete node.operation
    }

    const query = `
      mutation($createNodes: [CreateNodeInput]!, $createConnections: [CreateInvisibleNodeInput]!, $updateNodes: [UpdateNodeInput]!, $updateConnections: [UpdateInvisibleNodeInput]!, $floorId: ID!) {
        updateFloorPlan(createNodeInputs: $createNodes, createInvisibleNodeInputs: $createConnections, updateNodeInputs: $updateNodes, updateInvisibleNodeInputs: $updateConnections, id: $floorId) {
          id
          name
          nodes {
            id
            name
            state
            isExit
            ui {
              x
              y
            }
          }
          invisibleNodes {
            id
            connectedNodes {
              id
              name
              ui {
                x
                y
              }
            }
          }
        }
      }
    `

    const variables = {
      createNodes,
      updateNodes,
      createConnections,
      updateConnections,
      floorId
    }

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    }).then(
      res => res.json()
    ).then(
      res => {
        console.log(res)
        if(res?.data?.updateFloorPlan){
          const nodes = res.data.updateFloorPlan.nodes
          const mappedNodes = new Map()
          for(const node of nodes)mappedNodes.set(node.name, node)
          setNodes(mappedNodes)
          setConnections(res.data.updateFloorPlan.invisibleNodes)
          setPrevSelectedNode(null)
        }
        setUpload(false)
        navigate(`/floor/${floorId}`)
      }
    ).catch(
      err => {
        console.log(err)
        setUpload(false)
      }
    )
  }

  const createFloor = () => {
    if(!floorName?.length || !buildingId)return
    console.log(floorName)
    const query = `
      mutation{
        createFloor(createFloorInput: {name: "${floorName}", buildingId: "${buildingId}"}){
          id
        }
      }
    `

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ query })
    }).then(
      res => res.json()
    ).then(
      res => {
        console.log(res)
        if(res?.data?.createFloor){
          setFloorId(res.data.createFloor.id)
        }
      }
    ).catch(
      err => {
        console.log(err)
        setUpload(false)
      }
    )
  }

  useEffect(() => {
    if(floorId)uploadPlan()
  }, [floorId])

  const handleClick = (e) => {
    e.stopPropagation()
    if(floorId === null)setUpload(false)
  }

  const [ellipsisLength, setEllipsisLength] = useState(1)
  const updateLength = () => {
    if(ellipsisLength === 3)setEllipsisLength(1)
    else setEllipsisLength(ellipsisLength + 1)
  }
  useEffect(() => {
    const timeout = setTimeout(updateLength, 1000);
    return () => {
      clearTimeout(timeout)
    }
  }, [ellipsisLength])
  return (
    <Container onClick={handleClick}>
      { floorId?.length ? 
      <p>
        Uploading{".".repeat(ellipsisLength)}
      </p>: 
      <div onClick={e => e.stopPropagation()}>
        {/* We ask for name of floor here */}
        <h1>Add a floor name</h1>
        <TextField id="outlined-basic" label="Basic Name" variant="outlined" onInput={e => setFloorNmae(e.target.value)} />
        <div className='button-container'>
          <button onClick={createFloor}>Upload Plan</button>
        </div>
      </div>
    }
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
  p{
    font-size: 3em;
  }
  
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

export default Upload