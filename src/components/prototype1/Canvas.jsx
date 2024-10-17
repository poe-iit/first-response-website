import styled from "styled-components"
import { useEffect, useState } from "react"
import Node from "./Node"
import InvisibleNode from "./InvisibleNode"

// Node Schema
/*
name: string
state: string
isExit: boolean
floor: id (worry about this when uploading)
connections: [name]
ui{
  x: number
  y: number
}
*/

// Invisible Node Schema
/*
connectedNodes: [name, name]
floor: id (worry about this when uploading)
pattern: string -> xy or yx
*/

function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}


const Canvas = ({ state }) => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)

  const handleClick = (e) => {
    switch(state){
      case "create":
        console.log("create")
        const node = {
          name: generateUniqueId(),
          state: "safe",
          isExit: false,
          ui: {
            x: e.clientX,
            y: e.clientY
          },
          operation: "create"
        }
        setNodes([...nodes, node])
        break
      // case "connect":
      //   console.log("connect")
      //   break
      // case "disconnect":
      //   console.log("disconnect")
      //   break
      // case "update":
      //   console.log("update")
      //   break
      // case "delete":
      //   console.log("delete")
      //   break
      case "upload":
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

        for(const node of nodes){
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
              state
              isExit
              connections {
                name
              }
              ui {
                x
                y
              }
            }
          }
        `

        const variables = {
          createNodes,
          updateNodes,
          createConnections,
          updateConnections,
          floorId: "660e5641660cb8aa1184bf24"
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
            if("updateFloorPlan" in res?.data){
              setNodes([])
              setConnections([])
              setPrevSelectedNode(null)
            }

            // if(!res?.data?.loginUser){
            //   setLoginCount(loginCount + 1)
            // }else{
            //   setUser(res.data.loginUser)
            // }
          }
        ).catch(
          err => {
            console.log(JSON.stringify(err))
          }
        )

        console.log("upload")
        break
      default:
        console.log("default")
    }
  }

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
        if("getFloorPlan" in res?.data){
          setNodes(res.data.getFloorPlan.nodes)
          setConnections(res.data.getFloorPlan.invisibleNodes)
          setPrevSelectedNode(null)
        }
      }
    ).catch(
      err => {
        console.log(JSON.stringify(err))
      }
    )
  }

  useEffect(() => {
    console.log(connections)
  }, [connections])

  useEffect(() => {
    getFloorPlan("660e5641660cb8aa1184bf24")
    console.log("Restarted yay")
  }, [])

  useEffect(() => {
    console.log(nodes)
  }, [nodes])
  return (
    <Container onClick={handleClick}>
      {nodes.map(
        (node, index) => <Node 
          key={index}
          state={state}
          setNodes={setNodes}
          nodeData={node}
          setPrevSelectedNode={setPrevSelectedNode}
          prevSelectedNode={prevSelectedNode}
          setConnections={setConnections}
          connections={connections}
        />
      )}
      {connections.map(
        (connection, index) => <InvisibleNode
          key={index}
          state={state}
          connectionData={connection}
          connections={connections}
          setConnections={setConnections}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  height: 100vh;
  background-color: aliceblue;
`

export default Canvas