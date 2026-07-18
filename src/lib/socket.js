import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

const sockets = new Map();

/**
 * Get or create a Socket.IO client for a given namespace.
 * Namespaces used: /tracking, /dashboards, /visitors
 * Reuses connections across mounts to avoid duplicate handshakes.
 */
export function getSocket(namespace = "/") {
  if (sockets.has(namespace)) return sockets.get(namespace);
  const token = localStorage.getItem("jinanam_access_token");
  const socket = io(`${SOCKET_URL}${namespace}`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
  });
  sockets.set(namespace, socket);
  return socket;
}

export function disconnectAllSockets() {
  sockets.forEach((s) => {
    try { s.disconnect(); } catch { /* noop */ }
  });
  sockets.clear();
}

export { SOCKET_URL };
