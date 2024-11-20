import { Earth3D } from "./Earth3D";
import { EarthControls } from "./EarthControls";

export function EarthPage() {
  return (
    <div style={{ position: "relative" }}>
      <Earth3D />
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <EarthControls />
      </div>
    </div>
  );
}
