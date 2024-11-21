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

export const SUNSPOTS_GIF_PATH = "/~georgekw/SUNSPOTTER/sunspots.gif";

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
      <img
        style={{ width: 48, height: 48, marginRight: 16 }}
        src={SUNSPOTS_GIF_PATH}
      />
      <NavLink to={PATH_OPTICS}>1. sunspotter</NavLink>
      <NavLink to={PATH_PRINT}>2. print screens</NavLink>
      <NavLink to={PATH_CALCULATOR}>3. image rotation</NavLink>
      <NavLink to={PATH_EARTH}>4. earth model</NavLink>
      <NavLink to={PATH_ANIMATION}>5. spot animation</NavLink>
    </div>
  );
}
