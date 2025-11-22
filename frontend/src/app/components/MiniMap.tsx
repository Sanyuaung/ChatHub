"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Text as MantineText,
  Group,
  Avatar,
  Stack,
  Button,
  Tooltip,
} from "@mantine/core";
import { Map2, Satellite, Mountain, Refresh } from "tabler-icons-react";

interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  userId: string;
}

interface MiniMapProps {
  userLocation: { lat: number; lng: number } | null;
  messages: Array<{
    name: string;
    lat?: number;
    lng?: number;
    userId: string;
  }>;
  userName: string;
  userId: string;
  colors: any;
  theme: any;
  isDark: boolean;
  getRandomColor: (name: string) => string;
  getUserInitials: (name: string) => string;
}

const MiniMap: React.FC<MiniMapProps> = ({
  userLocation,
  messages,
  userName,
  userId,
  colors,
  theme,
  isDark,
  getRandomColor,
  getUserInitials,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const markers = useRef<{ [key: string]: any }>({});
  const tileLayer = useRef<any | null>(null);
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">(
    "street"
  );
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique locations from messages (EXCLUDING current user)
  const getUniqueLocations = (): LocationPoint[] => {
    const locationsMap = new Map<string, LocationPoint>();

    // Add locations from messages (excluding current user)
    messages.forEach((msg) => {
      if (msg.lat && msg.lng && msg.userId !== userId && !locationsMap.has(msg.userId)) {
        locationsMap.set(msg.userId, {
          name: msg.name,
          lat: msg.lat,
          lng: msg.lng,
          userId: msg.userId,
        });
      }
    });

    return Array.from(locationsMap.values());
  };

  // Create custom marker icon with user initials and color
  const createMarkerIcon = (name: string, isCurrentUser: boolean = false) => {
    if (!isClient) return null;

    const L = require("leaflet");
    const initials = getUserInitials(name);
    const color = getRandomColor(name).replace("#", "");
    const borderColor = isCurrentUser ? "3498db" : color;
    const borderWidth = isCurrentUser ? 4 : 2;

    // Create SVG for custom marker
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
          </filter>
        </defs>
        <path d="M 20 0 C 8.95 0 0 8.95 0 20 C 0 35 20 50 20 50 C 20 50 40 35 40 20 C 40 8.95 31.05 0 20 0 Z" fill="#${color}" filter="url(#shadow)"/>
        <circle cx="20" cy="18" r="12" fill="#ffffff" stroke="#${borderColor}" stroke-width="${borderWidth}"/>
        <text x="20" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="#${color}" font-family="Arial">${initials}</text>
      </svg>
    `;

    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    return L.icon({
      iconUrl: dataUrl,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    });
  };

  // Change map tile layer
  const changeMapStyle = (style: "street" | "satellite" | "terrain") => {
    if (!map.current || !isClient) return;

    const L = require("leaflet");

    // Remove old layer
    if (tileLayer.current) {
      map.current.removeLayer(tileLayer.current);
    }

    let newLayer: any;

    switch (style) {
      case "satellite":
        newLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri",
            maxZoom: 19,
          }
        );
        break;
      case "terrain":
        newLayer = L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
            maxZoom: 17,
          }
        );
        break;
      case "street":
      default:
        newLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        );
        break;
    }

    newLayer.addTo(map.current);
    tileLayer.current = newLayer;
    setMapStyle(style);
  };

  // Get unique locations early so it can be used in refresh handler
  const locations = getUniqueLocations();

  // Refresh location data - re-center map on all locations
  const handleRefreshLocations = () => {
    setIsRefreshing(true);
    const L = require("leaflet");
    
    if (map.current && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Simulate refresh animation
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Initialize map and handle marker updates
  useEffect(() => {
    if (!isClient || !mapContainer.current) return;

    const L = require("leaflet");

    // Initialize map only once
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([0, 0], 2);

      tileLayer.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map.current);

      // Fix Leaflet default icon issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }

    const locations = getUniqueLocations();

    // Update markers
    const currentMarkerIds = new Set(Object.keys(markers.current));
    const newMarkerIds = new Set(locations.map((l) => l.userId));

    // Remove old markers
    currentMarkerIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        map.current.removeLayer(markers.current[id]);
        delete markers.current[id];
      }
    });

    // Add or update markers
    locations.forEach((location) => {
      if (markers.current[location.userId]) {
        // Update existing marker position
        markers.current[location.userId].setLatLng([
          location.lat,
          location.lng,
        ]);
      } else {
        // Create new marker for other users
        const marker = L.marker([location.lat, location.lng], {
          icon: createMarkerIcon(location.name, false),
        })
          .bindPopup(
            `<div style="text-align: center; font-family: Arial;">
              <strong>${location.name}</strong><br/>
              ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
            </div>`,
            { maxWidth: 200 }
          )
          .addTo(map.current);

        markers.current[location.userId] = marker;
      }
    });

    // Fit all markers in view if there are any
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, messages, userId, userName, isClient]);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Map Style Controls */}
      {isClient && (
        <Box
          style={{
            padding: 8,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            gap: 6,
            background: colors.surface,
            justifyContent: "center",
          }}
        >
          <Tooltip label="Street View" withArrow>
            <Button
              size="xs"
              variant={mapStyle === "street" ? "filled" : "light"}
              onClick={() => changeMapStyle("street")}
              style={{ flex: 1 }}
            >
              <Map2 size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Satellite View" withArrow>
            <Button
              size="xs"
              variant={mapStyle === "satellite" ? "filled" : "light"}
              onClick={() => changeMapStyle("satellite")}
              style={{ flex: 1 }}
            >
              <Satellite size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Terrain View" withArrow>
            <Button
              size="xs"
              variant={mapStyle === "terrain" ? "filled" : "light"}
              onClick={() => changeMapStyle("terrain")}
              style={{ flex: 1 }}
            >
              <Mountain size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Refresh Location" withArrow>
            <Button
              size="xs"
              variant="light"
              onClick={handleRefreshLocations}
              loading={isRefreshing}
              style={{ flex: 1 }}
            >
              <Refresh size={16} />
            </Button>
          </Tooltip>
        </Box>
      )}

      {/* Map Container */}
      <Box
        ref={mapContainer}
        style={{
          flex: 1,
          background: "#e3f2fd",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${colors.border}`,
        }}
      />

      {/* Locations List */}
      <Box
        style={{
          padding: 12,
          maxHeight: 140,
          overflowY: "auto",
          background: colors.surface,
        }}
      >
        {locations.length === 0 ? (
          <MantineText
            size="xs"
            c={colors.textSecondary}
            style={{ textAlign: "center" }}
          >
            📍 Waiting for locations...
          </MantineText>
        ) : (
          <Stack gap={6}>
            {locations.map((location) => (
              <Group key={location.userId} gap={6} wrap="nowrap">
                <Avatar
                  size="xs"
                  radius="xl"
                  style={{
                    background: getRandomColor(location.name),
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials(location.name)}
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <MantineText
                    size="xs"
                    fw={600}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {location.name}
                  </MantineText>
                  <MantineText
                    size="xs"
                    c={colors.textSecondary}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </MantineText>
                </Box>
              </Group>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MiniMap;
