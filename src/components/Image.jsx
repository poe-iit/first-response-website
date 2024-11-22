import { useContext, useEffect, useRef } from 'react'
import { Image as KonvaImage } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const Image = () => {
  const imageRef = useRef()
  const canvasImageRef = useRef()
  const { image, state, stageRef, setImage, setUploadImage, setImageMeta } = useContext(CanvasContext)

  const positionDiff = useRef([0, 0])

  if(!imageRef.current)imageRef.current = document.createElement('img')
  imageRef.current.onload = () => {
    setImageMeta({
      width: imageRef.current.width,
      height: imageRef.current.height
    })
    canvasImageRef.current.image(imageRef.current)
  }
  useEffect(() => {
    console.log(image)
    if(imageRef.current){
      if(image?.url)imageRef.current.src = image.url
      if(image?.name)imageRef.current.alt = image.name
    }
  }, [image])

  const handleClick = (e) => {
    if(state === 'update'){
      setUploadImage(true)
    }
    console.log(e)
    const position = stageRef.current.getPointerPosition();
    const stagePosition = stageRef.current.position();
    console.log(e)
    console.log(e.target.x(), e.target.y(), position.x - stagePosition.x, position.y - stagePosition.y)
  }

  const handleDragStart = (e) => {
    const stagePosition = stageRef.current.position();
    const position = stageRef.current.getPointerPosition(); // Get pointer position relative to the stage
    const target = e.target;

    const x = position.x - stagePosition.x - target.x(); // Calculate offset from the target node
    const y = position.y - stagePosition.y - target.y();

    positionDiff.current = [x, y]; // Store the initial offset
  }

  const handleDragEnd = (e) => {
    // Maybe add an animation here
    const scale = stageRef.current.scaleX()
    const position = stageRef.current.position()

    const x = (e.evt.x - position.x - positionDiff.current[0]) / scale
    const y = (e.evt.y - position.y - positionDiff.current[1]) / scale
    // Factor in the offset of where the mouse was on the node for the final
    // calculation
    setImage(prev => ({...prev, position: [x, y] }))
  }

  return (
    <KonvaImage 
      x={Array.isArray(image?.position) ? image?.position[0] || 0 : 0}
      y={Array.isArray(image?.position) ? image?.position[1] || 0 : 0}
      ref={canvasImageRef}
      scale={{ x: Array.isArray(image?.scale) ? image?.scale[0] || 1 : 1, y: Array.isArray(image?.scale) ? image?.scale[1] || 1 : 1 }}
      onClick={handleClick}
      draggable={state === 'default'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    />
  )
}

export default Image