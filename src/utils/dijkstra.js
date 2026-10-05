/**
 * Compare two node ID sequences lexicographically.
 * @param {string[]} seqA 
 * @param {string[]} seqB 
 * @returns {number} negative if seqA < seqB, positive if seqA > seqB, 0 if equal
 */
export function compareNodeSequences(seqA, seqB) {
  const minLen = Math.min(seqA.length, seqB.length);
  for (let i = 0; i < minLen; i++) {
    const cmp = seqA[i].localeCompare(seqB[i]);
    if (cmp !== 0) return cmp;
  }
  return seqA.length - seqB.length;
}

/**
 * Calculate the lowest-cost evacuation route to an open exit using Dijkstra's algorithm.
 * 
 * Tie-breaker hierarchy:
 * 1. Lowest total cost
 * 2. Lexicographically smallest exit ID
 * 3. Lexicographically smallest node ID sequence
 * 
 * @param {Object} params
 * @param {Array} params.nodes - Array of node objects: { id, label, type, x, y }
 * @param {Array} params.edges - Array of edge objects: { id, from, to, cost }
 * @param {string} params.startNodeId - ID of starting room/junction
 * @param {Set<string>|Array<string>} params.blockedNodes - IDs of blocked nodes
 * @param {Set<string>|Array<string>} params.blockedEdges - IDs of blocked edges
 * @param {Set<string>|Array<string>} params.closedExits - IDs of closed exits
 * @returns {Object} Result object with status, cost, path, edgePath, exitId
 */
export function calculateEscapeRoute({
  nodes = [],
  edges = [],
  startNodeId,
  blockedNodes = new Set(),
  blockedEdges = new Set(),
  closedExits = new Set(),
}) {
  const blockedNodeSet = blockedNodes instanceof Set ? blockedNodes : new Set(blockedNodes);
  const blockedEdgeSet = blockedEdges instanceof Set ? blockedEdges : new Set(blockedEdges);
  const closedExitSet = closedExits instanceof Set ? closedExits : new Set(closedExits);

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Validate start node exists
  if (!startNodeId || !nodeMap.has(startNodeId)) {
    return {
      status: 'INVALID_START',
      message: 'Start location does not exist in graph.',
      path: [],
      edgePath: [],
      cost: Infinity,
      exitId: null,
    };
  }

  // Edge case 1: Starting location is blocked
  if (blockedNodeSet.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      message: 'Starting location blocked',
      path: [],
      edgePath: [],
      cost: Infinity,
      exitId: null,
    };
  }

  // Find all available (open and unblocked) exits
  const openExits = nodes.filter(
    n => n.type === 'exit' && !closedExitSet.has(n.id) && !blockedNodeSet.has(n.id)
  );

  if (openExits.length === 0) {
    return {
      status: 'NO_OPEN_EXITS',
      message: 'No open exits available',
      path: [],
      edgePath: [],
      cost: Infinity,
      exitId: null,
    };
  }

  // Build Adjacency List (bidirectional corridors)
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(edge => {
    // Skip if edge itself is blocked
    if (blockedEdgeSet.has(edge.id)) return;

    // Both endpoints must be valid
    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) return;

    // Endpoints must not be blocked (unless it's the start node or open destination)
    const fromBlocked = blockedNodeSet.has(edge.from);
    const toBlocked = blockedNodeSet.has(edge.to);

    const cost = Math.max(0, Number(edge.cost) || 0);

    // from -> to: valid if `to` is not blocked
    if (!toBlocked && !fromBlocked) {
      adj.get(edge.from).push({ to: edge.to, cost, edgeId: edge.id });
      adj.get(edge.to).push({ to: edge.from, cost, edgeId: edge.id });
    }
  });

  // Dijkstra data structures
  const dist = new Map();
  const bestPath = new Map();
  const bestEdgePath = new Map();
  const visited = new Set();

  nodes.forEach(n => {
    dist.set(n.id, Infinity);
    bestPath.set(n.id, []);
    bestEdgePath.set(n.id, []);
  });

  dist.set(startNodeId, 0);
  bestPath.set(startNodeId, [startNodeId]);
  bestEdgePath.set(startNodeId, []);

  // Priority queue / Min-distance loop
  const unvisited = new Set(nodes.map(n => n.id));

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    // In case of equal distance, pick one with lexicographically smallest node sequence
    let curr = null;
    let minD = Infinity;

    for (const nodeId of unvisited) {
      const d = dist.get(nodeId);
      if (d < minD) {
        minD = d;
        curr = nodeId;
      } else if (d === minD && d < Infinity && curr !== null) {
        // Tie-breaker for exploration: lexicographically smaller sequence
        if (compareNodeSequences(bestPath.get(nodeId), bestPath.get(curr)) < 0) {
          curr = nodeId;
        }
      }
    }

    if (curr === null || minD === Infinity) {
      // Remaining nodes are unreachable
      break;
    }

    unvisited.delete(curr);
    visited.add(curr);

    const currentPath = bestPath.get(curr);
    const currentEdgePath = bestEdgePath.get(curr);
    const currentDist = dist.get(curr);

    // Relax neighbors
    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const { to, cost, edgeId } = neighbor;
      if (visited.has(to)) continue;

      const newDist = currentDist + cost;
      const newPath = [...currentPath, to];
      const newEdgePath = [...currentEdgePath, edgeId];

      const oldDist = dist.get(to);

      if (newDist < oldDist) {
        dist.set(to, newDist);
        bestPath.set(to, newPath);
        bestEdgePath.set(to, newEdgePath);
      } else if (newDist === oldDist) {
        // Node sequence tie-breaker
        if (compareNodeSequences(newPath, bestPath.get(to)) < 0) {
          bestPath.set(to, newPath);
          bestEdgePath.set(to, newEdgePath);
        }
      }
    }
  }

  // Filter reached open exits
  const reachedExits = openExits.filter(exit => dist.get(exit.id) < Infinity);

  // Edge case 2: No route available
  if (reachedExits.length === 0) {
    return {
      status: 'NO_ROUTE',
      message: 'No route available',
      path: [],
      edgePath: [],
      cost: Infinity,
      exitId: null,
    };
  }

  // Find lowest total cost among reached open exits
  let minExitCost = Infinity;
  for (const exit of reachedExits) {
    const cost = dist.get(exit.id);
    if (cost < minExitCost) {
      minExitCost = cost;
    }
  }

  // Filter exits matching lowest total cost
  const tiedExits = reachedExits.filter(exit => dist.get(exit.id) === minExitCost);

  // Tie-breaker 2: Lexicographically smallest exit ID
  // Tie-breaker 3: Lexicographically smallest node ID sequence
  tiedExits.sort((a, b) => {
    // First compare exit ID
    const exitCmp = a.id.localeCompare(b.id);
    if (exitCmp !== 0) return exitCmp;

    // Then compare node ID sequence
    const pathA = bestPath.get(a.id);
    const pathB = bestPath.get(b.id);
    return compareNodeSequences(pathA, pathB);
  });

  const bestExit = tiedExits[0];

  return {
    status: 'ROUTE_FOUND',
    message: 'Optimal evacuation route calculated',
    cost: minExitCost,
    exitId: bestExit.id,
    path: bestPath.get(bestExit.id),
    edgePath: bestEdgePath.get(bestExit.id),
    destinationNode: bestExit,
    allReachedExits: reachedExits.map(e => ({
      id: e.id,
      label: e.label,
      cost: dist.get(e.id),
      path: bestPath.get(e.id)
    }))
  };
}
