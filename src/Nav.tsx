import { Link } from "react-router-dom";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 8 }}>
      <Link className="navLink" to={to}>
        {children}
      </Link>
    </div>
  );
}

export const PATH_ANIMATION = "/animation";
export const PATH_PRINT = "/print";
export const PATH_OPTICS = "/optics";
export const PATH_EARTH = "/earth";
export const PATH_CALCULATOR = "/calculator";

const GIF_PATH = "/~georgekw/SUNSPOTTER/sunspots.gif";

export function Nav() {
  //   const { isEdit, setIsEdit, setUrlData, addRows, deleteRow } = useGlobal();
  return (
    <div
      className="noprint"
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 8,
        paddingLeft: 16,
        background: "#181d1f",
        borderBottom: "1px solid rgba(88, 86, 82, 0.5)",
      }}
    >
      <img style={{ width: 48, height: 48, marginRight: 16 }} src={GIF_PATH} />
      <NavLink to={PATH_ANIMATION}>spot animation</NavLink>
      <NavLink to={PATH_OPTICS}>3D sunspotter</NavLink>
      <NavLink to={PATH_CALCULATOR}>image rotation</NavLink>
      <NavLink to={PATH_PRINT}>print screens</NavLink>
      <NavLink to={PATH_EARTH}>earth model</NavLink>
    </div>
  );
}
