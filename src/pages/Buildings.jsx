import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Floor from '../components/Floor'
import { Link } from 'react-router-dom'
import Navbar from '../components/navbar'; // Import the navbar
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreateBuilding from '../components/CreateBuilding';

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
}

const Buildings = () => {
  const [buildings, setBuildings] = useState([])
  const [creatingBuilding, setCreatingBuilding] = useState(false)
  const wsRef = useRef(null)

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`${import.meta.env.VITE_SERVER_URI}`, "graphql-transport-ws")
    const subscription = `
      subscription{
        buildingUpdates{
          id
          name
          floors{
            id
            name
          }
        }
      }
    `

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket")
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
      console.log(event)
      const data = JSON.parse(event.data)?.payload?.data || {}
      if(data?.buildingUpdates){
        setBuildings(data.buildingUpdates)
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
  const getBuildings = () => {
    const token = localStorage.getItem("token")
    const query = `
      query {
        getBuildings{
          id
          name
          floors{
            id
            name
          }
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
    ).then(
      res => {
        if("getBuildings" in res?.data){
          setBuildings(res.data.getBuildings)
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
    getBuildings()
    document.addEventListener("visibilitychange", reconnectIfNeeded)
    return () => {
      document.removeEventListener("visibilitychange", reconnectIfNeeded)
    }
  }, [])
  return (
    // Add option to delete floors and buildings
    <Container>
      <Navbar />
      <MainContent>
        <h2>System Overview</h2>
        {
          buildings.map((building, key) => (
            <Accordion className="building" key={key}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Link to={`/building/${building?.id}`} className='building-name'>{building?.name}</Link>
              </AccordionSummary>
              <AccordionDetails>
                <ul>
                {
                  building?.floors?.length ? building.floors.map((floor, key) => <Floor key={key} name={floor.name} id={floor.id} setBuildings={setBuildings} /> ): <></>
                }
                </ul>
                <Link to={`/building/${building?.id}/new`} className='new-floor'>Create a new floor</Link>
              </AccordionDetails>
            </Accordion>
          ))
        }
        <button className='new-building' onClick={() => setCreatingBuilding(true)}>Create a new building</button>
        {creatingBuilding ? <CreateBuilding setCreatingBuilding={setCreatingBuilding} /> : <></>}
      </MainContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  h2{
    margin: 1em 0;
  }
  a{
    display: block;
    color: #3a3aff;
    text-decoration: none;
  }
  .building-name{
    &:hover{
      text-decoration: underline;
    }
  }
  .new-building, .new-floor{
    text-decoration: none;
    color: white;
    background-color: #3a3aff;
    padding: 0.5em;
    border-radius: 0.5em;
    width: 100%;
    text-align: center;
  }
  .new-building{
    font-size: 1em;
    width: 80%;
    margin-top: 1em;
    outline: 0;
    border: 0;
    cursor: pointer;
  }
  .building{
    width: 80%;
  }
`
const MainContent = styled.div`
  flex-grow: 1;
  padding: 30px;
`;
export default Buildings