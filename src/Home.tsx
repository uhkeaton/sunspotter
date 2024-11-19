import { Link } from "react-router-dom";
import { PATH_ANIMATION, PATH_OPTICS, PATH_PRINT } from "./Nav";

export function Home() {
  return (
    <div style={{ margin: 32 }}>
      <div>Hello!</div>
      <div>
        <Link to={PATH_PRINT}>print</Link>
      </div>
      <div>
        <Link to={PATH_ANIMATION}>animation</Link>
      </div>
      <div>
        <Link to={PATH_OPTICS}>optics</Link>
      </div>
    </div>
  );
}
