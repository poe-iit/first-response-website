import { useEffect, useRef, useState} from "react"
import { useParams } from "react-router-dom"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"
import UpdateNodeData from "../components/UpdateNodeData"

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
}

const Floor = () => {
  const { id } = useParams()
  const stageRef = useRef()
  const [state, setState] = useState("")
  const [nodes, setNodes] = useState(new Map())
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)
  const [floorId, setFloorId] = useState(id)
  const [canvasIsDraggable, setCanvasIsDraggable] = useState(true)
  const [upload, setUpload] = useState(false)
  const [updateNode, setUpdateNode] = useState()
  const [nodeStates, setNodeStates] = useState(new Map())
  
  const getFloorPlan = (floorId) => {
    const query = `
      query($floorId: ID!){
        getFloorPlan(id: $floorId) {
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
            connections {
              id
              name
              direction
            }
          }
        }
      }
    `

    const variables = {
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
        if(res?.data?.getFloorPlan){
          const nodes = res.data.getFloorPlan.nodes
          const mappedNodes = new Map()
          for(const node of nodes){
            if(node?.name)mappedNodes.set(node.name, node)
          }
          setNodes(mappedNodes)
          setPrevSelectedNode(null)
        }
      }
    ).catch(
      err => {
        console.log(err)
      }
    )

    const websocket = new WebSocket(`${import.meta.env.VITE_SERVER_URI}`, "graphql-transport-ws")
    const subscription = `
      subscription{
        floorUpdate(id: "${floorId}") {
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
            connections {
              id
              name
              direction
            }
          }
        }
      }
    `

    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        "type": "connection_init"
      }))
      const id = generateRandomId()
      websocket.send(JSON.stringify({
        "id": id,
        "type": "subscribe",
        "payload": {
          "query": subscription
        }
      }))
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if(data?.payload?.data?.floorUpdate){
        const nodes = data.payload.data.floorUpdate.nodes
        const mappedNodes = new Map()
        for(const node of nodes){
          if(node?.name)mappedNodes.set(node.name, node)
        }
        setNodes(mappedNodes)
        setPrevSelectedNode(null)
      }
    }
  }

  useEffect(() => {
    getFloorPlan(id)
  }, [])

  return (
    <Container>
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, updateNode, setUpdateNode, nodeStates, setNodeStates  }}>
        <Canvas />
        <CanvasNavbar modulesAllowed={[
          "lock",
          // "default",
          "fire",
          // "create",
          // "connect",
          // "delete",
          // "exit",
          // "update",
          // "photo",
          "center",
          "upload",
          "edit"
        ]}/>
        {upload ? <Upload /> : <></>}
        {updateNode ? <UpdateNodeData /> : <></>}
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

export default Floor