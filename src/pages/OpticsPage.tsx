import { Sunspotter3D } from "../Sunspotter3D";
import OpticsDialog from "./OpticsDialog";

export function OpticsPage() {
  return (
    <div style={{ position: "relative" }}>
      <Sunspotter3D />
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <OpticsDialog />
      </div>
    </div>
  );
}
