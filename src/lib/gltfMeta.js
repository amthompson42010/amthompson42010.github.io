// Reads the JSON chunk out of a binary glTF (.glb) file ourselves, client
// side, to recover the per-node `extras` (category/floor/isStory) that the
// merge pipeline baked into each feature's node - see
// merge_collada_to_glb.py's build_combined_glb(). Cesium's own Model API
// doesn't expose a "list every node and its extras" call (only getNode(name)
// for a name you already know), so this gives the floor switcher the
// node-name -> floor lookup table it needs to know *which* nodes to show or
// hide for a given floor.
//
// GLB binary layout (little-endian):
//   header:  uint32 magic ("glTF"), uint32 version, uint32 totalLength
//   chunk 0: uint32 chunkLength, uint32 chunkType ("JSON"), chunkData (JSON text)
//   chunk 1: (optional binary buffer chunk - not needed here)
const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_TYPE_JSON = 0x4e4f534a; // "JSON"

function readGlbJsonChunk(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const magic = dv.getUint32(0, true);
  if (magic !== GLB_MAGIC) {
    throw new Error("Not a binary glTF (.glb) file - bad magic number.");
  }
  const chunkLength = dv.getUint32(12, true);
  const chunkType = dv.getUint32(16, true);
  if (chunkType !== CHUNK_TYPE_JSON) {
    throw new Error("Expected the first glTF chunk to be JSON.");
  }
  const jsonBytes = new Uint8Array(arrayBuffer, 20, chunkLength);
  const jsonText = new TextDecoder("utf-8").decode(jsonBytes);
  return JSON.parse(jsonText);
}

// Returns { nodesByFloor: Map<floorName|null, string[]>, allNodeNames: string[],
//           categoryByNode: Map<string, string|null>, oidByNode: Map<string, number|null> }
// `oid` is only non-null for INDIVIDUAL_CLICK_CATEGORIES nodes
// (merge_collada_to_glb.py) - one original ArcGIS feature per node there,
// versus null for a merged group representing many features at once.
export function parseGlbNodeExtras(arrayBuffer) {
  const json = readGlbJsonChunk(arrayBuffer);
  const nodesByFloor = new Map();
  const categoryByNode = new Map();
  const oidByNode = new Map();
  const allNodeNames = [];

  for (const node of json.nodes || []) {
    if (!node.name) continue;
    allNodeNames.push(node.name);
    const extras = node.extras || {};
    const floor = extras.floor ?? null;
    categoryByNode.set(node.name, extras.category ?? null);
    oidByNode.set(node.name, extras.oid ?? null);
    if (!nodesByFloor.has(floor)) nodesByFloor.set(floor, []);
    nodesByFloor.get(floor).push(node.name);
  }

  return { nodesByFloor, allNodeNames, categoryByNode, oidByNode };
}
