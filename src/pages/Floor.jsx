import { useEffect, useRef, useState} from "react"
import { useParams } from "react-router-dom"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
}

const Floor = ({ id }) => {
  if(!id){
    const params = useParams()
    id = params.id
  }
  const stageRef = useRef()
  const [state, setState] = useState("")
  const [nodes, setNodes] = useState(new Map())
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)
  const [floorId, setFloorId] = useState(id)
  const [canvasIsDraggable, setCanvasIsDraggable] = useState(true)
  const [upload, setUpload] = useState(false)
  const [nodeStates, setNodeStates] = useState(new Map())
  const [image, setImage] = useState(null)
  const [imageMeta, setImageMeta] = useState({width: 0, height: 0})
  const wsRef = useRef(null)

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`${import.meta.env.VITE_SERVER_URI}`, "graphql-transport-ws")
    const subscription = `
      subscription{
        floorUpdate(id: "${floorId}") {
          id
          name
          image{
            url
            name
            position
            scale
          }
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

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({
        "type": "connection_init"
      }))
      const id = generateRandomId()
      wsRef.current.send(JSON.stringify({
        "id": id,
        "type": "subscribe",
        "payload": {
          "query": subscription
        }
      }))
    }
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)
      if(data?.payload?.data?.floorUpdate){
        const nodes = data.payload.data.floorUpdate.nodes
        const mappedNodes = new Map()
        for(const node of nodes){
          if(node?.name)mappedNodes.set(node.name, node)
        }
        setNodes(mappedNodes)
        setPrevSelectedNode(null)
        setImage({
          name: data.payload.data.floorUpdate?.image?.name,
          url: data.payload.data.floorUpdate?.image?.url,
          position: data.payload.data.floorUpdate?.image?.position,
          initialUrl: data.payload.data.floorUpdate?.image?.url,
          scale: data.payload.data.floorUpdate?.image?.scale
        })
      }
    }
    wsRef.current.onclose = () => {
      reconnectIfNeeded()
    }
  }
  const reconnectIfNeeded = () => {
    console.log("Reconnecting...")
    if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
      connectWebSocket()
    }
  }
  
  const getFloorPlan = (floorId) => {
    const token = localStorage.getItem("token")
    const query = `
      query($floorId: ID!){
        getFloorPlan(id: $floorId) {
          id
          name
          image{
            url
            name
            position
            scale
          }
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
          setImage({
            name: res.data.getFloorPlan?.image?.name,
            url: res.data.getFloorPlan?.image?.url,
            position: res.data.getFloorPlan?.image?.position,
            initialUrl: res.data.getFloorPlan?.image?.url,
            scale: res.data.getFloorPlan?.image?.scale
          })
        }
      }
    ).catch(
      err => {
        console.log(err)
      }
    )

    connectWebSocket()
  }

  useEffect(() => {
    getFloorPlan(id)
    document.addEventListener("visibilitychange", reconnectIfNeeded)
    return () => {
      document.removeEventListener("visibilitychange", reconnectIfNeeded)
    }
  }, [])

  return (
    <Container>
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, nodeStates, setNodeStates, image, setImage, imageMeta, setImageMeta }}>
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
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default Floor