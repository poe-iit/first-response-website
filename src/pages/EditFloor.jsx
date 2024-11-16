import { useEffect, useRef, useState} from "react"
import { useParams } from "react-router-dom"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"
import UpdateNodeData from "../components/UpdateNodeData"
import ImageUpload from "../components/ImageUpload"

/*

  There should be a way to consolidate the data from websocket and current data
  Maybe when you get the websocket data, if they have the same name and it's
  operation is create then you add the id and update the operation to "update"

  If a node was deleted then you could delete the node from the plan
  If a node was updated then get the most up to date code, that way you get the
  updates but at the same time you don't lose yours

  Lastly, in the server isolate each node, each operation should finish it's
  update before moving to the next, do not batch save, it's creates an
  oppurtunity for race conditions and stale data
*/

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
}

const EditFloor = () => {
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
  const [uploadImage, setUploadImage] = useState(false)
  const [image, setImage] = useState(null)
  const wsRef = useRef(null)

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`${import.meta.env.VITE_SERVER_URI}`, "graphql-transport-ws")
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
        console.log(res)
        if(res?.data?.getFloorPlan){
          const nodes = res.data.getFloorPlan.nodes
          const mappedNodes = new Map()
          for(const node of nodes)mappedNodes.set(node.name, node)
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
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, updateNode, setUpdateNode, nodeStates, setNodeStates, uploadImage, setUploadImage, image, setImage }}>
        <Canvas edit={true} />
        <CanvasNavbar modulesAllowed={[
          "lock",
          "default",
          // "fire",
          "create",
          "connect",
          "delete",
          "exit",
          "update",
          "photo",
          "center",
          "upload",
          // "edit"
        ]}/>
        {upload ? <Upload /> : <></>}
        {updateNode ? <UpdateNodeData /> : <></>}
        {uploadImage ? <ImageUpload /> : <></>}
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

export default EditFloor