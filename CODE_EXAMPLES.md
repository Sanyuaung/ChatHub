# ChatHub - Code Examples & Best Practices

## Practical Reference for Implementation

---

## 📋 TABLE OF CONTENTS

1. Socket.IO Patterns
2. Geolocation Implementation
3. React Hooks Patterns
4. Map Integration Examples
5. Error Handling Strategies
6. TypeScript Patterns
7. Performance Tips

---

## 1️⃣ SOCKET.IO PATTERNS

### **Backend Event Handling Template**

```javascript
// server.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Broadcast user count
  const userCount = io.engine.clientsCount;
  io.sockets.emit("users", userCount);

  // Message event - broadcasts to ALL clients
  socket.on("chat", (messageData) => {
    const enrichedData = {
      ...messageData,
      timestamp: new Date().toISOString(),
      socketId: socket.id,
    };

    // Broadcast pattern
    io.sockets.emit("chat", enrichedData);
  });

  // Typing indicator - excludes sender
  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  // Room example (for future scaling)
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.sockets.emit("users", io.engine.clientsCount);
  });
});

httpServer.listen(4000, () => {
  console.log("Server running on port 4000");
});
```

### **Frontend Socket Connection & Events**

```javascript
// In ChatPage.tsx
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;  // Wait for userId

    // Create socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
      {
        query: { userId },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      }
    );

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Message event listener
    newSocket.on('chat', (messageData: Message) => {
      setMessages(prev => [...prev, messageData]);
    });

    // User count listener
    newSocket.on('users', (count: number) => {
      setOnlineUsers(count);
    });

    // Connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Send message
  const sendMessage = (messageText: string) => {
    if (!socket || !userId) return;

    const messageData: Message = {
      id: Date.now().toString(),
      name: userName,
      message: messageText,
      timestamp: new Date(),
      userId: userId,
      lat: userLocation?.lat,
      lng: userLocation?.lng
    };

    socket.emit('chat', messageData);
  };

  // Show typing indicator
  const handleTyping = () => {
    if (socket && !isTyping) {
      socket.emit('typing', userName);
      setIsTyping(true);

      // Clear after 2 seconds
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  return (
    <div>
      <div>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {/* UI components */}
    </div>
  );
}
```

### **Advanced: Socket Rooms Pattern**

```javascript
// Backend: Room-based messaging (for multiple chat groups)
socket.on("join-chat-room", (roomId) => {
  socket.join(roomId);
  socket.to(roomId).emit("notification", `User joined room ${roomId}`);
});

socket.on("room-message", (roomId, messageData) => {
  // Send only to users in this room
  io.to(roomId).emit("chat", messageData);
});

socket.on("leave-room", (roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("notification", "User left room");
});

// Frontend: Join a room
const joinChatRoom = (roomId: string) => {
  if (socket) {
    socket.emit("join-chat-room", roomId);
    socket.on(`chat-${roomId}`, (messageData) => {
      // Handle room-specific messages
    });
  }
};
```

---

## 2️⃣ GEOLOCATION IMPLEMENTATION

### **GPS Tracking with Error Handling**

```typescript
// hooks/useGeolocation.ts
import { useState, useRef, useEffect, useCallback } from "react";

interface Location {
  lat: number;
  lng: number;
}

type LocationStatus = "idle" | "requesting" | "active" | "denied";

interface GeolocationError {
  code: number;
  message: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;

    setLocation({ lat: latitude, lng: longitude });
    setAccuracy(accuracy);
    setStatus("active");
    setError(null);
    retryCountRef.current = 0;

    console.log(`📍 Location: ${latitude}, ${longitude} (±${accuracy}m)`);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setError({
      code: error.code,
      message: error.message,
    });

    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus("denied");
        console.error("❌ User denied location access");
        break;

      case error.POSITION_UNAVAILABLE:
        console.error("📍 Position unavailable (indoor?)");
        // Try again after delay
        setTimeout(() => startTracking(), 5000);
        break;

      case error.TIMEOUT:
        console.warn("⏱️ Location request timed out");
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          startTracking();
        } else {
          setStatus("idle");
        }
        break;
    }
  }, []);

  const startTracking = useCallback(() => {
    if ("geolocation" in navigator) {
      setStatus("requesting");

      const options: PositionOptions = {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000, // Wait max 10 seconds
        maximumAge: 0, // Always fresh location
      };

      // Use watchPosition for continuous updates
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } else {
      setError({
        code: 0,
        message: "Geolocation not supported",
      });
    }
  }, [handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setStatus("idle");
      setLocation(null);
    }
  }, []);

  // Auto-start on mount
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return {
    location,
    status,
    accuracy,
    error,
    startTracking,
    stopTracking,
  };
};

// Usage
const { location, status, accuracy, error } = useGeolocation();
```

### **Geolocation Error Recovery Pattern**

```typescript
const handleGeolocationError = (error: GeolocationPositionError) => {
  const errorStrategies = {
    PERMISSION_DENIED: {
      message: "Please enable location access in settings",
      action: () => showPermissionPrompt(),
      recoverable: false,
    },
    POSITION_UNAVAILABLE: {
      message: "Unable to get location. Retrying...",
      action: () => retryWithDelay(5000),
      recoverable: true,
    },
    TIMEOUT: {
      message: "Location request timed out",
      action: () => retryWithDelay(3000),
      recoverable: true,
    },
  };

  const strategy = errorStrategies[error.code] || {
    message: "Unknown error",
    recoverable: false,
  };

  console.error(strategy.message);
  strategy.action?.();
};

const retryWithDelay = (delayMs: number) => {
  setTimeout(() => {
    navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  }, delayMs);
};
```

### **Fallback: IP-Based Geolocation (Offline GPS)**

```typescript
// Fallback when GPS fails
const getFallbackLocation = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    return {
      lat: data.latitude,
      lng: data.longitude,
      accuracy: 50000, // Very rough estimate
    };
  } catch (error) {
    console.error("Fallback geolocation failed:", error);
    return null;
  }
};

// Use as last resort
if (gpsStatus === "denied" || gpsStatus === "unavailable") {
  const fallbackLocation = await getFallbackLocation();
  if (fallbackLocation) {
    setUserLocation(fallbackLocation);
  }
}
```

---

## 3️⃣ REACT HOOKS PATTERNS

### **Custom Hooks for Reusability**

```typescript
// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
};

// Usage
const [userName, setUserName] = useLocalStorage("userName", "");
```

### **Custom Hook: useDebounce**

```typescript
// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delayMs: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
};

// Usage: Debounce typing indicator
const [typingStatus, setTypingStatus] = useState("");
const debouncedTyping = useDebounce(typingStatus, 2000);

useEffect(() => {
  if (debouncedTyping) {
    socket.emit("typing", debouncedTyping);
  }
}, [debouncedTyping]);
```

### **Custom Hook: usePrevious**

```typescript
// hooks/usePrevious.ts
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// Usage: Detect if message count changed
const previousMessageCount = usePrevious(messages.length);
const newMessagesArrived = messages.length > (previousMessageCount || 0);
```

### **Custom Hook: useAsync**

```typescript
// hooks/useAsync.ts
interface AsyncState<T> {
  status: "idle" | "pending" | "success" | "error";
  data: T | null;
  error: Error | null;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [state, setState] = useState<AsyncState<T>>({
    status: "idle",
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ status: "pending", data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: "success", data: response, error: null });
    } catch (error) {
      setState({ status: "error", data: null, error: error as Error });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { ...state, execute };
};

// Usage: Load message history
const {
  data: messageHistory,
  status,
  error,
} = useAsync(() => fetch("/api/messages").then((r) => r.json()));
```

---

## 4️⃣ MAP INTEGRATION EXAMPLES

### **Leaflet Map Initialization (SSR-Safe)**

```typescript
// components/MiniMap.tsx
import { useEffect, useRef, useState } from "react";

interface Location {
  name: string;
  lat: number;
  lng: number;
}

export const MiniMap = ({ locations }: { locations: Location[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  // CRITICAL: Only initialize after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Import Leaflet on client side only
    const L = require("leaflet");
    const map = L.map(mapRef.current).setView([0, 0], 2);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each location
    locations.forEach((loc) => {
      L.marker([loc.lat, loc.lng])
        .bindPopup(
          `<b>${loc.name}</b><br>${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
        )
        .addTo(map);
    });

    // Auto fit bounds
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    leafletRef.current = map;

    return () => {
      map.remove();
    };
  }, [isClient, locations]);

  if (!isClient) return <div>Loading map...</div>;

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
};
```

### **Custom Marker with SVG Icons**

```typescript
const createCustomMarker = (name: string, color: string, isActive: boolean) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const svg = `
    <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <!-- Marker background -->
      <path d="M 20 0 C 8.95 0 0 8.95 0 20 C 0 35 20 50 20 50 C 20 50 40 35 40 20 C 40 8.95 31.05 0 20 0 Z"
            fill="${color}" 
            opacity="0.9"/>
      
      <!-- Glow effect for active user -->
      ${
        isActive
          ? `<circle cx="20" cy="20" r="18" fill="none" stroke="#4A90E2" stroke-width="2" opacity="0.5"/>`
          : ""
      }
      
      <!-- Inner circle -->
      <circle cx="20" cy="20" r="12" fill="white"/>
      
      <!-- Text initials -->
      <text x="20" y="25" 
            text-anchor="middle" 
            font-size="11" 
            font-weight="bold"
            fill="${color}">
        ${initials}
      </text>
    </svg>
  `;

  const L = require("leaflet");
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [40, 50],
    iconAnchor: [20, 50], // Point at marker
    popupAnchor: [0, -50], // Popup above marker
    shadowUrl:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJzaGFkb3ciPjxmZURyb3BTaGFkb3cgZHg9IjAiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLW9wYWNpdHk9IjAuMiIvPjwvZmlsdGVyPjwvZGVmcz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjE1MCIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiIGZpbGw9ImJsYWNrIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=",
    shadowSize: [50, 50],
    shadowAnchor: [25, 50],
  });
};

// Usage
const marker = L.marker([lat, lng], {
  icon: createCustomMarker("John Doe", "#FF6B6B", isCurrentUser),
}).addTo(map);
```

### **Dynamic Map Style Switching**

```typescript
const switchMapStyle = (style: "street" | "satellite" | "terrain") => {
  const L = require("leaflet");
  const map = leafletRef.current;

  if (!map) return;

  // Remove current layer
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });

  // Add new layer
  const tileConfigs = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attr: "© OpenStreetMap",
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attr: "© Esri",
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attr: "© OpenTopoMap",
    },
  };

  const config = tileConfigs[style];
  L.tileLayer(config.url, { attribution: config.attr, maxZoom: 19 }).addTo(map);
};
```

---

## 5️⃣ ERROR HANDLING STRATEGIES

### **Comprehensive Error Boundary**

```typescript
// components/ErrorBoundary.tsx
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
    // Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: "20px", color: "red" }}>
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### **Socket Error Handling Pattern**

```typescript
const setupSocketErrorHandling = (socket: Socket) => {
  // Connection errors
  socket.on("connect_error", (error: Error) => {
    console.error("❌ Connection error:", error);
    showNotification("Connection failed", "error");
  });

  // Specific error events from server
  socket.on("error", (error: string) => {
    console.error("❌ Server error:", error);
    showNotification(error, "error");
  });

  // Handle disconnect with reason
  socket.on("disconnect", (reason: string) => {
    console.log("Disconnected:", reason);

    if (reason === "io server disconnect") {
      // Server disconnected client, manual reconnect
      setTimeout(() => socket.connect(), 1000);
    } else if (reason === "transport close") {
      // Network error
      showNotification("Network error - reconnecting...", "warning");
    }
  });

  // Auto-reconnect on failure
  socket.io.on("reconnect_attempt", () => {
    console.log("🔄 Attempting to reconnect...");
  });
};
```

---

## 6️⃣ TYPESCRIPT PATTERNS

### **Strict Type Definitions**

```typescript
// types/index.ts

// Message type with all possible fields
export interface Message {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
  userId: string;
  image?: string; // Optional base64 image
  lat?: number; // Optional latitude
  lng?: number; // Optional longitude
}

// Chat state
export interface ChatState {
  messages: Message[];
  userLocation: Location | null;
  locationStatus: LocationStatus;
  isConnected: boolean;
  onlineUsers: number;
  typing: string | null;
}

// Socket event types
export interface SocketEvents {
  chat: (data: Message) => void;
  typing: (name: string) => void;
  users: (count: number) => void;
  connect: () => void;
  disconnect: () => void;
}

// API response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### **Generic Component Pattern**

```typescript
// components/List.tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  empty?: React.ReactNode;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  empty,
}: ListProps<T>) {
  if (items.length === 0) {
    return <>{empty || "No items"}</>;
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}

// Usage
<List
  items={messages}
  renderItem={(msg) => <MessageBubble {...msg} />}
  keyExtractor={(msg) => msg.id}
  empty={<p>No messages yet</p>}
/>;
```

---

## 7️⃣ PERFORMANCE TIPS

### **Memoization Pattern**

```typescript
import { useMemo, useCallback } from "react";

// 1. Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return messages
    .filter((m) => m.name === currentUser)
    .sort((a, b) => b.timestamp - a.timestamp);
}, [messages, currentUser]);

// 2. Memoize callback functions
const handleSendMessage = useCallback(
  (text: string) => {
    if (!socket) return;
    socket.emit("chat", { message: text, timestamp: new Date() });
  },
  [socket]
);

// 3. Memoize component
const MessageBubble = React.memo(
  ({ message }: { message: Message }) => <div>{message.text}</div>,
  (prevProps, nextProps) => {
    // Custom comparison - return true if props are equal
    return prevProps.message.id === nextProps.message.id;
  }
);
```

### **Virtual Scrolling for Long Lists**

```typescript
// For 1000+ messages, use virtual scrolling
import { FixedSizeList as List } from "react-window";

export const VirtualMessageList = ({ messages }: { messages: Message[] }) => (
  <List height={600} itemCount={messages.length} itemSize={80} width="100%">
    {({ index, style }) => (
      <div style={style}>
        <MessageBubble message={messages[index]} />
      </div>
    )}
  </List>
);
```

### **Image Optimization**

```typescript
// Compress image before sending
const compressImage = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Scale down
  canvas.width = 300;
  canvas.height = 300;
  ctx.drawImage(bitmap, 0, 0, 300, 300);

  // Convert to base64 with compression
  return canvas.toDataURL("image/jpeg", 0.7); // 70% quality
};
```

---

## 🎯 KEY TAKEAWAYS

✅ **Always use Socket.IO, not raw WebSockets** (easier reconnection, fallbacks)

✅ **Prefer watchPosition over getCurrentPosition** (continuous tracking)

✅ **Lazy-load Leaflet in useEffect** (avoid SSR errors)

✅ **Use useRef for side effects** (GPS watch IDs, cleanup)

✅ **Implement proper error handling** (timeouts, permissions, network)

✅ **Memoize expensive calculations** (performance with large datasets)

✅ **Create reusable custom hooks** (cleaner component code)

✅ **Use TypeScript strictly** (catch errors at compile time)

---

**Happy coding! 🚀**
