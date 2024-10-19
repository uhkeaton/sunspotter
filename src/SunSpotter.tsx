import { useState } from "react";

const inputContainerStyle: React.HTMLAttributes<HTMLDivElement>["style"] = {
  display: "inline-flex",
  flexDirection: "column",
  marginRight: 16,
};

export function SunSpotter() {
  const [size, setSize] = useState(500);
  const [number, setNumber] = useState(1);
  const [spacing, setSpacing] = useState(0);
  const [opacity, setOpacity] = useState(1);
  return (
    <div
      style={{
        height: " 100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
      }}
    >
      <div>
        <div style={inputContainerStyle}>
          <label htmlFor="size">{`Size: ${size}`}</label>
          <input
            className="noprint"
            id="size"
            style={{ width: 100 }}
            type="range"
            min="10"
            max="1000"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
            }}
          />
        </div>
        <div style={inputContainerStyle}>
          <label htmlFor="opacity">{`Opacity: ${opacity}`}</label>
          <input
            className="noprint"
            id="opacity"
            style={{ width: 100 }}
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            onChange={(e) => {
              setOpacity(Number(e.target.value) / 100);
            }}
          />
        </div>
        <div className="noprint" style={inputContainerStyle}>
          <label htmlFor="number">Number:</label>
          <select
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>

        {number > 1 && (
          <div style={inputContainerStyle}>
            <label htmlFor="spacing">{`Spacing: ${spacing}`}</label>
            <input
              className="noprint"
              id="spacing"
              style={{ width: 100 }}
              type="range"
              min="0"
              max="100"
              value={spacing * 100}
              onChange={(e) => {
                setSpacing(Number(e.target.value) / 100);
              }}
            />
          </div>
        )}
      </div>
      {Array(number)
        .fill(0)
        .map(() => {
          return (
            <div
              style={{
                height: size,
                width: size,
                margin: "auto",
                marginTop: `${spacing * 25}%`,
                marginBottom: `${spacing * 25}%`,
              }}
            >
              <div
                style={{ position: "relative", height: "100%", width: "100%" }}
              >
                <img
                  style={{ height: "100%", width: "100%", opacity: opacity }}
                  src="https://solar-center.stanford.edu/images/sungrid-0.gif"
                />
                <div
                  style={{
                    height: "82%",
                    width: "82%",
                    border: "1px solid black",
                    borderRadius: "100%",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
