import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

/**
 * useSocket — subscribe to a Socket.IO namespace with typed event handlers.
 *
 * @param {string} namespace  e.g. "/tracking", "/dashboards", "/visitors"
 * @param {object} handlers   { eventName: handlerFn, ... }
 * @param {object} options    { query, enabled }
 * @returns { connected, socket }
 */
export function useSocket(namespace, handlers = {}, options = {}) {
  const { enabled = true, query = {} } = options;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;

    const socket = getSocket(namespace);
    socketRef.current = socket;

    // Attach query params if provided
    if (Object.keys(query).length && socket.io?.opts) {
      socket.io.opts.query = { ...socket.io.opts.query, ...query };
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Wire caller-provided handlers
    const events = Object.keys(handlersRef.current || {});
    const wrapped = {};
    events.forEach((ev) => {
      wrapped[ev] = (...args) => {
        const fn = handlersRef.current?.[ev];
        if (typeof fn === "function") fn(...args);
      };
      socket.on(ev, wrapped[ev]);
    });

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      events.forEach((ev) => socket.off(ev, wrapped[ev]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, enabled, JSON.stringify(query)]);

  return { connected, socket: socketRef.current };
}
