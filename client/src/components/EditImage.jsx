import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { FormControl, FormHelperText, TextField } from '@mui/material'
import { CanvasContext } from '../hook/CanvasContext'


const EditImage = ({open, setOpen}) => {
  const { image, setImage } = useContext(CanvasContext)
  const [name, setName] = useState(image?.updatedName || image?.name || "")
  const [position, setPosition] = useState({
    x: !image?.updatedPosition ? image?.position?.at(0) | 0 : image.updatedPosition?.at(0) || 0,
    y: !image?.updatedPosition ? image?.position?.at(1) | 0 : image.updatedPosition?.at(1) || 0
  })
  const [scale, setScale] = useState(isNaN(image.updatedScale) ? image.scale || 1 : image.updatedScale || 1)
  // Image name
  // Image x and y
  // Image zoom
  // Upload new Image
  // Delete image

  useEffect(() => {
    setName(image?.updatedName || image?.name || "")
    setPosition({
      x: !image?.updatedPosition ? image?.position?.at(0) || 0 : image.updatedPosition?.at(0) || 0,
      y: !image?.updatedPosition ? image?.position?.at(1) || 0 : image.updatedPosition?.at(1) || 0
    })
    setScale(isNaN(image.updatedScale) ? image.scale || 1 : image.updatedScale || 1)
  }, [image])

  const handleUpdate = () => {
    if(name.length === 0){
      alert("Name cannot be empty")
      return
    }
    if(isNaN(position.x)) {
      alert("Invalid position.x")
      return
    }
    if(isNaN(position.y)) {
      alert("Invalid position.y")
      return
    }
    if(isNaN(scale)) {
      alert("Invalid scale")
      return
    }
    if(scale === 0){
      alert("Scale cannot be 0")
      return
    }
    setImage(prevImage => {
      return {
        ...prevImage,
        updatedName: name,
        updatedPosition: [position.x, position.y],
        updatedScale: scale
      }
    })
    setOpen(false)
  }

  const handleReset = () => {
    setOpen(false)
    setImage(prevImage => {
      delete prevImage["updatedName"]
      delete prevImage["updatedPosition"]
      delete prevImage["updatedScale"]
      delete prevImage["updatedUrl"]
      // Check if updatedUrl starts with https if it does, then delete it
      return prevImage
    })
  }
  

  return (
    open ? <Container onClick={e => setOpen(false)}>
      <div className='content-container'
        onClick={e => e.stopPropagation()}
      >
        <h2>Image Configuration</h2>
        <FormControl fullWidth>
          <TextField label="Display Name" variant='outlined' value={name} onInput={e => setName(e.target.value)}/>
        </FormControl>
        <FormControl>
          <TextField label="Position X-Axis" variant='outlined' value={position.x} type='number' onInput={e => setPosition(prevPosition => ({...prevPosition, x: e.target.value}))}/>
        </FormControl>
        <FormControl>
          <TextField label="Position Y-Axis" variant='outlined' value={position.y} type='number' onInput={e => setPosition(prevPosition => ({...prevPosition, y: e.target.value}))}/>
        </FormControl>
        <FormControl fullWidth>
          <TextField type="number" label="Scale" variant='outlined' value={scale} onInput={e => setScale(e.target.value)}/>
        </FormControl>
        <label htmlFor="file">Upload New Image
          <input type='file' accept="image/*" id="file" name='file'
            onChange={(e) => {
              const file = e.target.files[0]
              const reader = new FileReader();
              reader.onload = function(event) {
                const blobUrl = event.target.result
                setImage(prevImage => {
                  return {
                    ...prevImage,
                    updatedUrl: blobUrl
                  }
                })
              }
              if(file)reader.readAsDataURL(file)
            }}
          />
        </label>
        <div className='button-container'>
          <button className='delete' onClick={handleReset}>Reset Image</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </Container> : null
  )
}

export default EditImage

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
    h2{
      margin-bottom: 0.5em;
    }
    > div{
      margin-bottom: 1em;
    }
    > label, button{
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
      &.delete{
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
      }
      &:hover{
        filter: brightness(90%);
      }
    }
    > label{
      font-size: 0.93em;
      input{
        display: none;
      }
    }
    .button-container{
      margin-top: 1em;
      display: flex;
      flex-direction: row;
      gap: 1em;
    }
  }
`