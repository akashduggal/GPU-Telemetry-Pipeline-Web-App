# 🖥️ Frontend System Design: GPU Telemetry Dashboard

**Author**: Akash

---

This document provides a detailed explanation of the frontend architecture for the GPU Telemetry Pipeline application. It covers the system design, technology choices, component structure, state management, and potential future improvements.

## 📜 Table of Contents

- [1. System Goals and Requirements](#1-system-goals-and-requirements)
- [2. System Design and Architecture](#2-system-design-and-architecture)
  - [High-Level Overview](#high-level-overview)
  - [Component Hierarchy](#component-hierarchy)
  - [Data Flow](#data-flow)
- [3. Component Deep Dive](#3-component-deep-dive)
  - [`App.js`](#appjs)
  - [`GpuCard.js`](#gpucardjs)
  - [`GpuChart.js`](#gpuchartjs)
  - [`Header.js` & `LoadingIndicator.js`](#headerjs--loadingindicatorjs)
- [4. Technology Stack Rationale](#4-technology-stack-rationale)
- [5. State Management](#5-state-management)
- [6. Styling and Theming](#6-styling-and-theming)
- [7. Architectural Tradeoffs](#7-architectural-tradeoffs)
- [8. Future Enhancements](#8-future-enhancements)
- [9. Running the Application](#9-running-the-application)

---

## 🎯 1. System Goals and Requirements

I designed the frontend with the following goals in mind:

-   **Real-time Visualization**: The primary goal is to display a live stream of GPU telemetry data with minimal latency.
-   **Multi-GPU Support**: The UI must be able to handle and display data from multiple GPUs simultaneously, allowing the user to switch between them easily.
-   **Rich Data Display**: The application should present multiple metrics for each GPU (temperature, power, etc.) in a clear and intuitive way using charts.
-   **Responsive Design**: The layout must adapt to different screen sizes, from large monitors to smaller devices.
-   **User-Friendly Interface**: The UI should be clean, modern, and easy to navigate.
-   **Resilience**: The application should gracefully handle WebSocket disconnections and provide a way for the user to reconnect.

---

## 🏗️ 2. System Design and Architecture

### High-Level Overview

The frontend is a **single-page application (SPA)** built with **React**. Its primary responsibility is to connect to a WebSocket server, receive streaming data, manage the application's state, and render that state as a series of responsive and informative UI components. The architecture is centered around a main `App` component that orchestrates data fetching, state management, and rendering of child components.

### Component Hierarchy

The application has a straightforward component hierarchy, which I've illustrated below.

![GPU Telemetry Dashboard - Frontend Architecture](GPU%20Telemetry%20Dashboard%20-%20Frontend%20Architecture.png)

### Data Flow

The data flow is unidirectional and driven by the WebSocket connection.

1.  **Connection**: The `App.js` component establishes a WebSocket connection to the backend's `/ws/telemetry` endpoint on mount.
2.  **Data Reception**: The `onmessage` handler in `App.js` listens for incoming data. Each message contains a JSON payload with the latest metrics for a specific GPU.
3.  **State Update**: Upon receiving a message, I update the central `gpuMetrics` state. This state is an object where keys are GPU IDs. Each GPU ID maps to another object containing arrays of historical data for each metric. To prevent unbounded memory growth, I cap the data points for each metric at `30`, creating a sliding window of recent telemetry.
4.  **Props Drilling**: The updated state is passed down as props to child components. `App.js` passes the data for the currently selected GPU to the `GpuCard` component.
5.  **Rendering**: `GpuCard` then maps over the metrics for that GPU and passes the relevant data array for each metric down to a `GpuChart` component.
6.  **Visualization**: Each `GpuChart` component uses the **Recharts** library to render the time-series data as a responsive area chart.

---

## 🧩 3. Component Deep Dive

#### `App.js`

-   **Responsibility**: The root component and the brain of the application.
-   **Implementation**:
    -   **State**: Manages the application's core state using React Hooks (`useState`, `useEffect`, `useRef`). This includes the WebSocket connection status, the main `gpuMetrics` data object, and the currently `selectedGpu`.
    -   **WebSocket Logic**: Contains all the logic for connecting, receiving messages, and handling disconnection/errors from the WebSocket. I used a `useCallback` hook for the `connect` function to stabilize it.
    -   **Layout**: Renders the main application layout, including the `Header` and the Material-UI `Tabs` for GPU selection. It conditionally renders a `LoadingIndicator` before the first data arrives.

#### `GpuCard.js`

-   **Responsibility**: A container that displays all the metric charts for a single, selected GPU.
-   **Implementation**: A presentational component that receives the data for one GPU as props. It iterates through the metrics (temperature, power, etc.) and renders a `GpuChart` for each one, passing down the necessary data and styling information. The layout is a flex container that allows charts to wrap on smaller screens.

#### `GpuChart.js`

-   **Responsibility**: To visualize a single time-series metric for one GPU.
-   **Implementation**:
    -   Uses the **Recharts** library (`AreaChart`, `ResponsiveContainer`, `Tooltip`, etc.) to render the chart.
    -   It's a highly reusable component, configured by props like `data`, `dataKey`, `color`, and `icon`.
    -   It includes custom formatting for timestamps on the X-axis and in the tooltip.
    -   The chart's colors and styles are derived from the Material-UI theme for a consistent look and feel.

#### `Header.js` & `LoadingIndicator.js`

-   **`Header.js`**: A simple component that displays the application title and a connection status indicator with a reconnect button.
-   **`LoadingIndicator.js`**: A straightforward centered spinner that is shown while the application is waiting for the initial data from the WebSocket.

---

## 🛠️ 4. Technology Stack Rationale

| Technology | Rationale |
| --- | --- |
| **React** | I chose React for its component-based architecture, which is a natural fit for building a modular and maintainable UI. The ecosystem and community support are unparalleled. The use of React Hooks (`useState`, `useEffect`) allows for powerful and expressive functional components. |
| **Material-UI (MUI)** | For the UI, I selected Material-UI for its comprehensive set of high-quality, pre-built components (Tabs, Paper, Icons, etc.). This accelerated development and ensured a consistent, modern design. Its theming capabilities are excellent for customizing the application's appearance. |
| **Recharts** | I chose Recharts for data visualization because it's a simple, declarative charting library built for React. It offers great performance, is easy to use, and provides good-looking charts out of the box. The `ResponsiveContainer` makes creating responsive charts trivial. |
---

## 🧠 5. State Management

The application's state management is intentionally simple and localized, relying entirely on **React Hooks**.

-   **`useState`**: Used for managing all pieces of component state, such as `gpuMetrics`, `connected`, and `selectedGpu`.
-   **`useEffect`**: Used to manage side effects, primarily to establish and tear down the WebSocket connection when the `App` component mounts and unmounts. It's also used to automatically select the first GPU once data becomes available.
-   **`useRef`**: Used to hold a mutable reference to the WebSocket instance across renders without triggering a re-render itself.
-   **`useCallback`**: Used to memoize the `connect` function, preventing it from being recreated on every render. This is a performance optimization and helps stabilize dependencies in `useEffect`.

Given the application's current scope, I determined that a more complex state management library like Redux or MobX would be overkill. The state is not deeply nested and flows in a simple, unidirectional way.

---

## 🎨 6. Styling and Theming

-   **Styling Engine**: The project uses **Material-UI's** styling solution, which leverages **Emotion** under the hood. Styles are primarily applied using the `sx` prop, which allows for writing CSS directly within the component's JSX.
-   **Custom Theme (`theme.js`)**: I defined a custom theme to override Material-UI's default colors and typography, ensuring a unique look for the application. The `useTheme` hook is used within components like `GpuChart` to access theme values dynamically.

---

## ⚖️ 7. Architectural Tradeoffs

-   **Simplicity vs. Scalability**: I opted for a simple architecture with local state management. This makes the application easy to understand and maintain at its current size. The tradeoff is that if the application were to grow significantly in complexity (e.g., adding complex user interactions, more routes, global settings), managing state with only React Hooks could become cumbersome. At that point, migrating to a global state manager would be necessary.
-   **Props Drilling**: There is some minor "props drilling" (e.g., passing `metricDetails` from `App` to `GpuCard` to `GpuChart`). For this small application, it's perfectly acceptable. In a larger app, I would use the Context API or a state management library to avoid this.

---

## 🚀 8. Future Enhancements

-   **Historical Data Fetching**: Implement a feature to fetch historical data from the `/metrics` REST endpoint, perhaps using a date picker to select a time range.
-   **Global State Management**: If the app grows, I would introduce **Redux Toolkit** for more robust and scalable state management. This would also eliminate the need for props drilling.
-   **Component Memoization**: For performance optimization, I would wrap components like `GpuChart` in `React.memo` to prevent re-renders when their props haven't changed.
-   **Code Splitting**: For larger applications, I would use `React.lazy()` and `Suspense` to split the code into smaller chunks, improving the initial load time.
-   **Enhanced Chart Interactions**: Add features to the charts like zooming, panning, and exporting data as CSV.

---

## ⚙️ 9. Running the Application

To run the frontend development server:

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Start the server: `npm start`

The application will be available at `http://localhost:3000`.

