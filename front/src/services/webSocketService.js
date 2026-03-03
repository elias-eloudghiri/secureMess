class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect(uuid) {
    if (this.socket) {
      return;
    }
    // Using simple ws/wss protocol for Spring TextWebSocketHandler
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      window.location.hostname === "localhost"
        ? "localhost:8080"
        : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("Connected to WS");
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "AUTH", uuid }));
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach((listener) => listener(data));
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WS");
      this.socket = null;
      // Reconnect logic disabled for now to prevent React 18 strict mode loops
      // setTimeout(() => this.connect(uuid), 3000);
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  sendMessage(messageObj) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "MESSAGE",
          ...messageObj,
        }),
      );
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.socket) {
      // Remove all event listeners so we don't try to reconnect or send on a closed socket
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onmessage = null;
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new WebSocketService();
