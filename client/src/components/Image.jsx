import {useState, useContext, useEffect } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const Image = ({ setOpen }) => {

  const { image, mouseState, position, scale, setImage } = useContext(CanvasContext)
  const [imagePosition, setImagePosition] = useState({x: 0, y: 0})

  const deleteImage = async (imageUrl) => {
    const publicId = imageUrl.split("/").pop().split(".")[0]
    console.log(publicId)
    const { signature, timestamp } = await fetch(`${import.meta.env.VITE_SERVER_URL}/generate_signature?public_id=${publicId}`).then(res => res.json())
    
    await fetch("https://api.cloudinary.com/v1_1/dkibqlalh/image/destroy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        public_id: publicId,
        upload_preset: "i2k8fkqj",
        api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
        signature,
        timestamp
      })
    }).then(res => res.json())
    .catch(err => console.log(err))
  }
  // console.log(image)
  const handleClick = async () => {
    console.log("Clicked", mouseState)
    if(mouseState === "editImage"){
      setOpen(true)
      console.log("clicked")
      return
    }
    if(mouseState === "delete"){
      if(image?.url?.length)await deleteImage(image.url)
      setImage({})
      return
    }
    // Add delete and others
  }

  useEffect(() => {
    let x = 0, y = 0
    if(image?.updatedPosition){
      x = image?.updatedPosition?.at(0)
      y = image?.updatedPosition?.at(1)
    }else if(image?.position){
      x = image?.position?.at(0)
      y = image?.position?.at(1)
    }
    setImagePosition({x, y})
  }, [position, image, scale])
  return (
    <image {...imagePosition} href={image.updatedUrl?.length ? image.updatedUrl : image.url} onClick={handleClick} transform={`scale(${isNaN(image?.updatedScale) ? image?.scale || 1 : image?.updatedScale})`} data-title={image.updatedName || image.name} style={{
      cursor: mouseState === "editImage" ? "pointer" : "default",
      transform: `\
      translate(${position[0]}px, ${position[1]}px) scale(${(!isNaN(image?.updatedScale) || !isNaN(image.scale)) ? (isNaN(image?.updatedScale) ? image?.scale || 1 : image?.updatedScale) * scale : scale})`
    }}/>
  )
}

export default Image