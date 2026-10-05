/**
 * Validates the uploaded or pasted JSON floor plan against the required Smart Escape schema.
 * 
 * Schema:
 * - nodes: array of { id, label, type: 'room'|'junction'|'exit', x: number, y: number }
 * - edges: array of { id, from: string, to: string, cost: number >= 0 }
 * - initial_state: { blocked_nodes: string[], blocked_edges: string[], closed_exits: string[] }
 * 
 * @param {string|Object} rawInput 
 * @returns {{ isValid: boolean, data: Object|null, errors: string[] }}
 */
export function validateFloorPlanJson(rawInput) {
  const errors = [];
  let parsed = null;

  // 1. JSON Parse Check
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch (err) {
      return {
        isValid: false,
        data: null,
        errors: [`Invalid JSON syntax: ${err.message}`]
      };
    }
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    parsed = rawInput;
  } else {
    return {
      isValid: false,
      data: null,
      errors: ['Input must be a valid JSON string or object.']
    };
  }

  // 2. Root Structure Check
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      data: null,
      errors: ['Root JSON must be an object with "nodes", "edges", and optional "initial_state".']
    };
  }

  // 3. Nodes Validation
  if (!Array.isArray(parsed.nodes)) {
    errors.push('Required property "nodes" must be an array.');
  } else if (parsed.nodes.length === 0) {
    errors.push('"nodes" array cannot be empty. Floor plan must contain at least one node.');
  } else {
    const nodeIds = new Set();
    const validTypes = new Set(['room', 'junction', 'exit']);
    let hasExit = false;

    parsed.nodes.forEach((node, idx) => {
      const prefix = `Node[${idx}]`;

      if (!node || typeof node !== 'object') {
        errors.push(`${prefix} is not a valid object.`);
        return;
      }

      if (typeof node.id !== 'string' || !node.id.trim()) {
        errors.push(`${prefix} missing valid non-empty string "id".`);
      } else {
        if (nodeIds.has(node.id)) {
          errors.push(`Duplicate node id "${node.id}" at index ${idx}. Node IDs must be unique.`);
        }
        nodeIds.add(node.id);
      }

      if (typeof node.label !== 'string') {
        errors.push(`${prefix} ("${node.id || idx}") missing "label" string.`);
      }

      if (!validTypes.has(node.type)) {
        errors.push(
          `${prefix} ("${node.id || idx}") has invalid type "${node.type}". Must be 'room', 'junction', or 'exit'.`
        );
      } else if (node.type === 'exit') {
        hasExit = true;
      }

      if (typeof node.x !== 'number' || isNaN(node.x)) {
        errors.push(`${prefix} ("${node.id || idx}") coordinate "x" must be a valid number.`);
      }

      if (typeof node.y !== 'number' || isNaN(node.y)) {
        errors.push(`${prefix} ("${node.id || idx}") coordinate "y" must be a valid number.`);
      }
    });

    if (!hasExit && parsed.nodes.length > 0) {
      errors.push('Map does not contain any "exit" nodes. At least one emergency exit is required.');
    }
  }

  // 4. Edges Validation
  if (!Array.isArray(parsed.edges)) {
    errors.push('Required property "edges" must be an array.');
  } else {
    const edgeIds = new Set();
    const existingNodeIds = new Set(
      Array.isArray(parsed.nodes) ? parsed.nodes.map(n => n.id).filter(Boolean) : []
    );

    parsed.edges.forEach((edge, idx) => {
      const prefix = `Edge[${idx}]`;

      if (!edge || typeof edge !== 'object') {
        errors.push(`${prefix} is not a valid object.`);
        return;
      }

      if (typeof edge.id !== 'string' || !edge.id.trim()) {
        errors.push(`${prefix} missing valid non-empty string "id".`);
      } else {
        if (edgeIds.has(edge.id)) {
          errors.push(`Duplicate edge id "${edge.id}" at index ${idx}. Edge IDs must be unique.`);
        }
        edgeIds.add(edge.id);
      }

      if (typeof edge.from !== 'string' || !edge.from.trim()) {
        errors.push(`${prefix} missing "from" node reference.`);
      } else if (!existingNodeIds.has(edge.from)) {
        errors.push(`${prefix} ("${edge.id || idx}") references non-existent "from" node: "${edge.from}".`);
      }

      if (typeof edge.to !== 'string' || !edge.to.trim()) {
        errors.push(`${prefix} missing "to" node reference.`);
      } else if (!existingNodeIds.has(edge.to)) {
        errors.push(`${prefix} ("${edge.id || idx}") references non-existent "to" node: "${edge.to}".`);
      }

      if (typeof edge.cost !== 'number' || isNaN(edge.cost) || edge.cost < 0) {
        errors.push(
          `${prefix} ("${edge.id || idx}") "cost" must be a non-negative number (negative cost not allowed, got ${edge.cost}).`
        );
      }
    });
  }

  // 5. Initial State Validation (optional, but if present must be well-formed)
  const initialState = {
    blocked_nodes: [],
    blocked_edges: [],
    closed_exits: [],
  };

  if (parsed.initial_state) {
    if (typeof parsed.initial_state !== 'object' || Array.isArray(parsed.initial_state)) {
      errors.push('"initial_state" must be an object.');
    } else {
      const { blocked_nodes, blocked_edges, closed_exits } = parsed.initial_state;

      if (blocked_nodes) {
        if (!Array.isArray(blocked_nodes) || !blocked_nodes.every(id => typeof id === 'string')) {
          errors.push('"initial_state.blocked_nodes" must be an array of string IDs.');
        } else {
          initialState.blocked_nodes = [...blocked_nodes];
        }
      }

      if (blocked_edges) {
        if (!Array.isArray(blocked_edges) || !blocked_edges.every(id => typeof id === 'string')) {
          errors.push('"initial_state.blocked_edges" must be an array of string IDs.');
        } else {
          initialState.blocked_edges = [...blocked_edges];
        }
      }

      if (closed_exits) {
        if (!Array.isArray(closed_exits) || !closed_exits.every(id => typeof id === 'string')) {
          errors.push('"initial_state.closed_exits" must be an array of string IDs.');
        } else {
          initialState.closed_exits = [...closed_exits];
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      data: null,
      errors,
    };
  }

  // Sanitized output
  return {
    isValid: true,
    data: {
      name: parsed.name || 'Custom Floor Plan',
      nodes: parsed.nodes,
      edges: parsed.edges,
      initial_state: initialState,
    },
    errors: [],
  };
}
