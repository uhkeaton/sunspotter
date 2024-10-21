import { Link } from "react-router-dom";

export function Home() {
  return (
    <div style={{ margin: 32 }}>
      <div>Hello!</div>
      <div>
        <Link to="/print">print</Link>
      </div>
      <div>
        <Link to="/animation">animation</Link>
      </div>
    </div>
  );
}
