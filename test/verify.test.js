import { calculateEscapeRoute, compareNodeSequences } from '../src/utils/dijkstra.js';
import { validateFloorPlanJson } from '../src/utils/validator.js';
import { PRESET_MAPS } from '../src/utils/presets.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TESTING SMART ESCAPE LOGIC ---');

// TEST 1: Default Corporate HQ calculation
const hqPreset = PRESET_MAPS.find(p => p.id === 'corporate_hq');
const resHq = calculateEscapeRoute({
  nodes: hqPreset.data.nodes,
  edges: hqPreset.data.edges,
  startNodeId: hqPreset.defaultStart,
  blockedNodes: hqPreset.data.initial_state.blocked_nodes,
  blockedEdges: hqPreset.data.initial_state.blocked_edges,
  closedExits: hqPreset.data.initial_state.closed_exits,
});

assert(resHq.status === 'ROUTE_FOUND', 'Default Corporate HQ finds route');
assert(resHq.cost === 30, `Expected cost 30, got ${resHq.cost}`);
assert(resHq.exitId === 'EX_WEST', `Expected exit EX_WEST, got ${resHq.exitId}`);
assert(JSON.stringify(resHq.path) === JSON.stringify(['R_OFFICE_101', 'J_NORTH', 'EX_WEST']), 'Path sequence matches expected optimal route');

// TEST 2: Start Location Blocked
const resBlockedStart = calculateEscapeRoute({
  nodes: hqPreset.data.nodes,
  edges: hqPreset.data.edges,
  startNodeId: 'R_OFFICE_101',
  blockedNodes: ['R_OFFICE_101'],
  blockedEdges: [],
  closedExits: [],
});
assert(resBlockedStart.status === 'START_BLOCKED', 'Detects starting location blocked');
assert(resBlockedStart.message === 'Starting location blocked', 'Correct error message for blocked start');

// TEST 3: No Route Available
const resNoRoute = calculateEscapeRoute({
  nodes: hqPreset.data.nodes,
  edges: hqPreset.data.edges,
  startNodeId: 'R_OFFICE_101',
  blockedNodes: ['J_NORTH'], // Only connection from Office 101 is J_NORTH
  blockedEdges: [],
  closedExits: [],
});
assert(resNoRoute.status === 'NO_ROUTE', 'Detects no route available when path is severed');

// TEST 4: Tie-breaker 2 - Lexicographically smallest exit ID
// In tie_breaker_lab:
// Path to EX_A: ROOM_START -> J_ALPHA -> J_GAMMA -> EX_A (cost: 20 + 20 + 20 = 60)
// Path to EX_B: ROOM_START -> J_BETA -> J_DELTA -> EX_B (cost: 20 + 20 + 20 = 60)
// Costs are equal (60).
// 'EX_A' < 'EX_B' lexicographically. EX_A MUST WIN!
const tiePreset = PRESET_MAPS.find(p => p.id === 'tie_breaker_lab');
const resTieExit = calculateEscapeRoute({
  nodes: tiePreset.data.nodes,
  edges: tiePreset.data.edges,
  startNodeId: 'ROOM_START',
  blockedNodes: [],
  blockedEdges: [],
  closedExits: [],
});

assert(resTieExit.status === 'ROUTE_FOUND', 'Tie-breaker scenario finds route');
assert(resTieExit.cost === 60, `Cost is 60, got ${resTieExit.cost}`);
assert(resTieExit.exitId === 'EX_A', `Tie-breaker 2: EX_A chosen over EX_B (got ${resTieExit.exitId})`);
assert(JSON.stringify(resTieExit.path) === JSON.stringify(['ROOM_START', 'J_ALPHA', 'J_GAMMA', 'EX_A']), 'Path chooses lexicographical node sequence to EX_A');

// TEST 5: Tie-breaker 3 - Lexicographically smallest node ID sequence to same exit
// Suppose EX_A is closed, so only EX_B is available.
// Path 1 to EX_B: ROOM_START -> J_BETA -> J_DELTA -> EX_B (cost: 60)
// Suppose we add an alternative equal cost path to EX_B through J_ALPHA:
// If we had equal cost paths to the same exit, lexicographically smaller sequence wins:
const seqCmp = compareNodeSequences(['ROOM_START', 'J_ALPHA', 'EX_A'], ['ROOM_START', 'J_BETA', 'EX_A']);
assert(seqCmp < 0, "['ROOM_START', 'J_ALPHA', 'EX_A'] is lexicographically smaller than ['ROOM_START', 'J_BETA', 'EX_A']");

// TEST 6: JSON Schema Validator
const validJson = JSON.stringify(hqPreset.data);
const valSuccess = validateFloorPlanJson(validJson);
assert(valSuccess.isValid === true, 'Validator accepts valid floor plan schema');

// TEST 7: JSON Schema Validator on malformed inputs
const malformedJson1 = '{"nodes": [], "edges": []}';
const valEmptyNodes = validateFloorPlanJson(malformedJson1);
assert(valEmptyNodes.isValid === false, 'Validator rejects empty nodes array');

const malformedJson2 = JSON.stringify({
  nodes: [{ id: 'N1', label: 'Room 1', type: 'invalid_type', x: 0, y: 0 }],
  edges: []
});
const valInvalidType = validateFloorPlanJson(malformedJson2);
assert(valInvalidType.isValid === false, 'Validator rejects invalid node type');

const malformedJson3 = JSON.stringify({
  nodes: [{ id: 'EX1', label: 'Exit 1', type: 'exit', x: 0, y: 0 }],
  edges: [{ id: 'E1', from: 'NON_EXISTENT', to: 'EX1', cost: -5 }]
});
const valBadEdge = validateFloorPlanJson(malformedJson3);
assert(valBadEdge.isValid === false, 'Validator rejects edge referencing non-existent node and negative cost');
assert(valBadEdge.errors.some(e => e.includes('negative cost')), 'Error message mentions negative cost');
assert(valBadEdge.errors.some(e => e.includes('non-existent "from" node')), 'Error message mentions non-existent node');

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
