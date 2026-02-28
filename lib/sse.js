/**
 * Server-Sent Events (SSE) manager.
 * Maintains a Map of connected SSE clients per restaurant.
 */

// Map<restaurantId, Set<res>>
const clients = new Map();

function addClient(restaurantId, res) {
  if (!clients.has(restaurantId)) {
    clients.set(restaurantId, new Set());
  }
  clients.get(restaurantId).add(res);
}

function removeClient(restaurantId, res) {
  const set = clients.get(restaurantId);
  if (set) {
    set.delete(res);
    if (set.size === 0) clients.delete(restaurantId);
  }
}

function broadcast(restaurantId, event, data) {
  const set = clients.get(restaurantId);
  if (!set || set.size === 0) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    res.write(payload);
  }
}

module.exports = { addClient, removeClient, broadcast };
