import { createContext } from "react";

export const CanvasContext = createContext({
  stageRef: {current: null},
  floorId: null,
  setFloorId: () => {},
  state: "default",
  setState: () => {},
  nodes: new Map(),
  setNodes: () => {},
  connections: [],
  setConnections: () => {},
  prevSelectedNode: null,
  setPrevSelectedNode: () => {},
  canvasIsDraggable: true,
  setCanvasIsDraggable: () => {},
  upload: false,
  setUpload: () => {},
  updateNode: undefined,
  setUpdateNode: () => {},
  nodeStates: new Map(),
  setNodeStates: () => {},
  uploadImage: false,
  setUploadImage: () => {},
  image: {},
  setImage: () => {},
  imageMeta: {
    width: 0,
    height: 0
  },
  setImageMeta: () => {},
})