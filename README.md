# Project Documentation

## Overview

This project is a React-based application featuring real-time updates for floor plans and various user interface components. The primary components enable users to view, update, and interact with node-based floor plans, handling real-time updates through WebSockets and integrating with a GraphQL API.

## Components

### Floor

The `Floor` component is responsible for rendering the canvas for a specific floor plan. It uses WebSockets to subscribe to real-time updates, retrieving the layout and node data of the floor plan from a GraphQL server.

- **State**:
  - `floorId`: Stores the current floor ID based on URL parameters.
  - `nodes`: Map of nodes on the floor, each containing metadata such as location, state, and connections.
  - `connections`: Array to manage node connections.
  - `canvasIsDraggable`: Boolean that controls canvas dragging.
  - `upload` and `updateNode`: States to toggle the display of the `Upload` and `UpdateNodeData` components.
  - `nodeStates`: Stores the states of individual nodes.

- **Methods**:
  - `connectWebSocket`: Establishes a WebSocket connection to subscribe to floor updates.
  - `getFloorPlan`: Fetches the initial floor plan data using a GraphQL query.
  - `reconnectIfNeeded`: Reconnects WebSocket if disconnected.

- **Subcomponents**:
  - `Canvas`, `CanvasNavbar`, `Upload`, `UpdateNodeData`

---

### App

The `App` component serves as the main entry point, initializing routes and managing the overall structure of the application.

- **Routes**:
  - Home (`/`)
  - Login (`/login`)
  - Floor (`/floor/:id`)
  - Buildings (`/buildings`)
  - Logs (`/logs`)

### Buildings

The `Buildings` component displays a list of buildings. Each building can be selected to view the associated floors and their details.

### Home

The `Home` component serves as the landing page, providing navigation to other sections like `Buildings` and `Login`.

### Login

The `Login` component provides a user authentication form for logging into the application.

### Logs

The `Logs` component is dedicated to displaying a log of events or activities related to the floor plans or other components.

## Context and State Management

### CanvasContext

This context (`CanvasContext`) allows `Floor` and its child components to share state variables and functions, enabling interaction with the canvas and node management.

## APIs and WebSocket Connection

- **GraphQL API**: Used to fetch and update floor plan data. The API requests are made using `fetch` with query and mutation operations for reading and updating nodes.
- **WebSocket**: Used for real-time updates to the floor plan. The connection subscribes to floor updates based on `floorId`.

## Styling

Styled-components are used for CSS styling, allowing for scoped component-level styles.

---

## Future Work / Considerations

- **Error Handling**: Ensure robust error handling for WebSocket disconnections and GraphQL request failures.
- **Optimization**: Consider optimizing `Map` usage for large node sets.
- **User Interface**: Explore adding animations or more intuitive visual cues for node connections and updates.

This documentation provides a foundational overview and can be expanded with details on individual function arguments, response data structures, and specific GraphQL queries/mutations as needed.
