import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Floor from './Floor'
import FloorPlan from '../components/FloorPlan'
import styled from 'styled-components'

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
}

const Building = () => {
  const { id } = useParams()
  const [buildingName, setBuildingName] = useState("Loading...")
  const [floors, setFloors] = useState([])
  const wsRef = useRef(null)
  const connectWebSocket = (buildingId) => {
    wsRef.current = new WebSocket(`${import.meta.env.VITE_SERVER_URI}`, "graphql-transport-ws")
    const subscription = `
      subscription{
        buildingUpdate(id: "${buildingId}") {
          name
          floors{
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
      const data = JSON.parse(event.data)?.payload?.data || {}
      if(data?.buildingUpdate){
        setBuildingName(data.buildingUpdate.name)
        setFloors(data.buildingUpdate.floors)
      }
    }
    wsRef.current.onclose = () => {
      reconnectIfNeeded()
    }
  }
  const reconnectIfNeeded = () => {
    console.log("Reconnecting...")
    if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
      connectWebSocket(id)
    }
  }
  const getBuilding = () => {
    const token = localStorage.getItem("token")
    const query = `
      query($buildingId: ID!){
        getBuilding(id: $buildingId) {
          name
          floors{
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
      }
    `

    const variables = {
      buildingId: id
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
        if(res?.data?.getBuilding){
          setBuildingName(res.data.getBuilding.name)
          setFloors(res.data.getBuilding.floors)
        }
      }
    ).catch(
      err => {
        console.log(err)
      }
    )

    connectWebSocket(id)
  }
  useEffect(() => {
    getBuilding()
    document.addEventListener("visibilitychange", reconnectIfNeeded)
    return () => {
      document.removeEventListener("visibilitychange", reconnectIfNeeded)
    }
  }, [])
  return (
    <Container>
      <h2>{buildingName}</h2>
      <ul>
        {
          floors?.length ? floors.map((floor, key) => (
          <li key={key}>
            <Link to={`/floor/${floor.id}`}>{floor.name}</Link>
            <FloorPlan key={key} floor={floor} />
          </li>
          )) : <></>
        }
      </ul>
    </Container>
  )
}

export default Building

const Container = styled.div`
  padding: 0.3em;
  display: flex;
  flex-direction: column;
  align-items: center;
  ul{
    width: 90%;
    min-height: 100vh;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding: 0.5em;
    gap: 1em;
    li{
      border: 1px solid #c6c6c6;
      border-radius: 0.3em;
      overflow: hidden;
      height: 32em;
      > a{
        padding: 0.5em;
        line-height: 1em;
        font-size: 1.2em;
        display: block;
        text-decoration: none;
        color: #3a3aff;
        &:hover{
          text-decoration: underline;
        }
      }
      > div{
        height: 30em!important;
      }
    }
  }
`