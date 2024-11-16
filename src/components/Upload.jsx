
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CanvasContext } from '../hooks/CanvasContext'
import TextField from '@mui/material/TextField';
import { useParams, useNavigate } from 'react-router-dom';

const Upload = () => {
  const { floorId, nodes, image, setNodes, setPrevSelectedNode, setUpload, setImage } = useContext(CanvasContext)

  const { buildingId } = useParams()

  const [floorName, setFloorName] = useState("")

  const navigate = useNavigate()

  const uploadPlan = () => {
    const token = localStorage.getItem("token")

    const nodesArr = []

    const floorData = {
      id: floorId,
      name: floorName,
      buildingId,
      image: {
        url: image?.url,
        name: image?.name,
        position: image?.position,
        scale: image?.scale
      }
    }

    for(const [_, node] of nodes){
      if(node.operation){
        nodesArr.push(node)
      }
    }

    floorData.nodes = nodesArr
    // floorData.nodes = []

    const query = `
      mutation($floorData: CreateFloorInput!) {
        createFloor(createFloorInput: $floorData) {
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
      floorData
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
        const { data } = res
        if(data?.payload?.data?.createFloor){
          const nodes = data.payload.data.createFloor.nodes
          const mappedNodes = new Map()
          for(const node of nodes){
            if(node?.name)mappedNodes.set(node.name, node)
          }
          setNodes(mappedNodes)
          setPrevSelectedNode(null)
          setImage({
            name: data.payload.data.createFloor?.image?.name,
            url: data.payload.data.createFloor?.image?.url,
            position: data.payload.data.createFloor?.image?.position,
            initialUrl: data.payload.data.createFloor?.image?.url,
            scale: data.payload.data.createFloor?.image?.scale
          })
        }
        setUpload(false)
        navigate(`/floor/${res?.data?.createFloor?.id}`)
      }
    ).catch(
      err => {
        console.log(err)
        setUpload(false)
      }
    )
  }

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
  useEffect(() => {
    if(floorId?.length)uploadPlan()
  }, [floorId])
  return (
    <Container onClick={handleClick}>
      { floorId?.length ? 
      <p>
        Uploading{".".repeat(ellipsisLength)}
      </p>: 
      <div onClick={e => e.stopPropagation()}>
        {/* We ask for name of floor here */}
        <h1>Add a floor name</h1>
        <TextField id="outlined-basic" label="Basic Name" variant="outlined" onInput={e => setFloorName(e.target.value)} />
        <div className='button-container'>
          <button onClick={() => {
            if(floorName?.length)uploadPlan()
          }}>Upload Plan</button>
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