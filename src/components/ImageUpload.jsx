import { useContext, useRef, useState } from 'react'
import styled from 'styled-components'
import { CanvasContext } from '../hooks/CanvasContext';
import TextField from '@mui/material/TextField';

// Make env variables
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadToCloudinary(file) {
  // Cloudinary upload URL and your unsigned upload preset
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  // Create FormData to hold the file and preset data
  const formData = new FormData();
  formData.append("file", file); // 'file' is the image file from e.target.files[0]
  formData.append("upload_preset", uploadPreset); // Set the upload preset

  // Perform the upload with fetch API
  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  })
  const data = await response.json()
  return data
}

function deleteFromCloudinary(imageUrl) {
  const publicId = imageUrl.split('/').pop().split('.')[0]
  const token = localStorage.getItem("token")
  const query = `
    query{
      deleteImage(id: "${publicId}")
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
  })
  // Doesn't matter if we failed, we tried our best

}

const ImageUpload = () => {
  const inputRef = useRef(null)
  const { image, setImage, setUploadImage } = useContext(CanvasContext)
  const [imageUrl, setImageUrl] = useState(image?.url)
  const [name, setName] = useState(image?.name || "")
  const [position, setPosition] = useState(image?.position || [0, 0])
  const [scale, setScale] = useState(image?.scale || [1, 1])
  const handleNameChange = (e) => {
    setName(e.target.value)
  }
  const handlePositionChange = (e, axis) => {
    if(isNaN(e.target.value))return
    switch(axis) {
      case "x":
        setPosition([e.target.value, position[1]])
        break
      case "y":
        setPosition([position[0], e.target.value])
        break
    }
  }
  const handleScaleChange = (e, axis) => {
    console.log(e.target.value)
    if(isNaN(e.target.value))return
    switch(axis) {
      case "x":
        setScale([e.target.value, scale[1]])
        break
      case "y":
        setScale([scale[0], e.target.value])
        break
    }
  }

  const updateImageMetaData = () => {
    const newImage = {...image}
    if(name?.length)newImage.name = name
    const positionX = Number(position[0]), positionY = Number(position[1]), scaleX = Number(scale[0]), scaleY = Number(scale[1])
    if(!newImage.position)newImage.position = [0, 0]
    if(!isNaN(positionX))newImage.position[0] = positionX
    if(!isNaN(positionY))newImage.position[1] = positionY
    if(!newImage.scale)newImage.scale = [1, 1]
    if(!isNaN(scaleX))newImage.scale[0] = scaleX || 1
    if(!isNaN(scaleY))newImage.scale[1] = scaleY || 1
    if(imageUrl?.length)newImage.url = imageUrl
    setImage(newImage)
    setUploadImage(false)
  }
  return (
    <Container onClick={(e) => {
      e.stopPropagation()
      setUploadImage(false)
    }}>
      <div onClick={(e) => e.stopPropagation()}>
        <label 
          htmlFor="file"
          onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
          onDrop={async (e) => {
            e.preventDefault()
            const file = e.target.files[0]
            console.log(file)
            if(imageUrl && imageUrl !== image.initialUrl)deleteFromCloudinary(imageUrl)
            if(file){
              const response = await uploadToCloudinary(file)
              console.log(response)
              if (response.secure_url) {
                console.log("Image uploaded successfully:", response.secure_url);
                setImageUrl(response.secure_url)
                // You can use data.secure_url as the URL of the uploaded image
              } else {
                console.error("Upload failed:", response);
              }
            }
          }}
        >
          <p>Drag and drop an image or</p>
          <button onClick={() => inputRef.current.click()}>Click to Upload</button>
          <input type='file' accept="image/*" id="file" name='file' ref={inputRef}
            onChange={async (e) => {
              e.preventDefault()
              const file = e.target.files[0]
              console.log(file)
              if(imageUrl && imageUrl !== image.initialUrl)deleteFromCloudinary(imageUrl)
              if(file){
                const response = await uploadToCloudinary(file)
                console.log(response)
                if (response.secure_url) {
                  console.log("Image uploaded successfully:", response.secure_url);
                  setImageUrl(response.secure_url)
                  // You can use data.secure_url as the URL of the uploaded image
                } else {
                  console.error("Upload failed:", response);
                }
              }
            }}
          />
        </label>
        <h3>Image Name</h3>
        <TextField
          id="outlined-basic"
          label="Image Name"
          variant="outlined"
          value={name}
          onInput={handleNameChange}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
        <h3>Image Position</h3>
        <div id="position-container">
          <TextField
            type="number"
            id="outlined-basic"
            label="Position X"
            variant="outlined"
            value={position[0]}
            onInput={(e) => handlePositionChange(e, "x")}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <TextField
            type="number"
            id="outlined-basic"
            label="Position Y"
            variant="outlined"
            value={position[1]}
            onInput={(e) => handlePositionChange(e, "y")}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>
        <h3>Image Scale</h3>
        <div id="scale-container">
          <TextField
            type="number"
            id="outlined-basic"
            label="Scale X"
            variant="outlined"
            value={scale[0]}
            onInput={(e) => handleScaleChange(e, "x")}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <TextField
            type="number"
            id="outlined-basic"
            label="Scale Y"
            variant="outlined"
            value={scale[1]}
            onInput={(e) => handleScaleChange(e, "y")}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>
        <div className='button-container' onClick={updateImageMetaData}>
          <button>Update Image</button>
        </div>
      </div>
    </Container>
  )
}

export default ImageUpload

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
    width: 50%;
    height: 80%;
    min-width: 30em;

    > label{
      width: 100%;
      height: 100%;
      border-radius: 1em;
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      padding: 0.6em;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      line-height: 24px;
      font-size: 0.93em;
      font-weight: 500;
      border: 1px dashed black;
      &.delete{
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
      }
      &:hover{
        filter: brightness(90%);
      }
      p{
        font-size: 1.5em;
      }
      button{
        border: 0;
        outline: 0;
        background-color: #4949e8;
        margin-top: 0.8em;
        color: white;
        padding: 0.5em 0.6em;
        font-size: 1.2em;
        border-radius: 0.3em;
      }
      input{
        display: none;
      }
    }
    #position-container, #scale-container{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 1em;
      div{
        flex: 1;
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