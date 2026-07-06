// Applies a MESH_STYLES entry (see meshStyles.js) to the real ghost (`mat`)
// and aluminum (`al`) materials. `color`/`emissive` are THREE.Color objects
// and must go through `.set()`, not plain assignment. `iridescenceThicknessRange`
// is cloned so per-frame animation (in AnatomyModel's useFrame) never mutates
// the shared style constant.
function applyProps(target, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "color" || key === "emissive") target[key].set(value);
    else if (key === "iridescenceThicknessRange") target[key] = [...value];
    else target[key] = value;
  }
  target.needsUpdate = true;
}

export function applyMeshStyle(mat, al, style) {
  applyProps(mat, style.mat);
  if (style.al) applyProps(al, style.al);
}
