import { useState } from "react";
import {
  dateRange,
  degToPercent,
  isDefined,
  RotationData,
  sphericalToPosition,
  positionToSpherical,
  percentToDeg,
  rotatePoint,
} from "../helpers";
import { useGlobal } from "../useGlobal";
import { GRID_COLOR, GRID_OPACITY, SPOT_SIZE } from "../constants";
import { TableRotationInput } from "../TableRotationInput";
import { Box, Checkbox, Slider, Tab, Typography } from "@mui/material";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { TableRotationOutput } from "../TableRotationOutput";

export function toRotationData(rows: string[][]): RotationData[] {
  return rows.map(([date, lat, long, rotation]) => {
    return {
      date: date,
      lat: parseFloat(lat),
      long: parseFloat(long),
      rotation: parseFloat(rotation),
    };
  });
}

export let mockRotationRows: string[][] = [
  //
  ["10/18/2024", "-14", "15", "-5"],
  ["10/18/2024", "-15", "20", "-5"],
  ["10/18/2024", "8", "28", "-5"],
  ["10/18/2024", "7", "35", "-5"],
  ["", "", "", ""],
  //
  ["10/21/2024", "-15", "-30", "-5"],
  ["10/21/2024", "-18", "48", "-5"],
  ["10/21/2024", "-23", "70", "-5"],
  ["", "", "", ""],
  //
  ["10/23/2024", "-6", "-50", "-8"],
  ["10/23/2024", "-10", "-8", "-8"],
  ["", "", "", ""],
  //
  ["10/24/2024", "12", "-58", "-36"],
  ["10/24/2024", "9", "-55", "-36"],
  ["10/24/2024", "11", "-48", "-36"],
  ["10/24/2024", "5", "-37", "-36"],
  ["10/24/2024", "-15", "1", "-36"],
  ["", "", "", ""],
  //
  ["10/29/2024", "-14", "-14", "-19"],
  ["10/29/2024", "-10", "15", "-19"],
  ["10/29/2024", "-10", "20", "-19"],
  ["", "", "", ""],
  //
  ["11/06/2024", "-15", "-5", "53"],
  ["11/06/2024", "-7", "4", "53"],
  ["11/06/2024", "27", "5", "53"],
  ["", "", "", ""],
  //
  ["11/07/2024", "-7", "-70", "-3"],
  ["11/07/2024", "-9", "-3", "-3"],
  ["11/07/2024", "-10", "2", "-3"],
  ["11/07/2024", "-9", "10", "-3"],
  ["11/07/2024", "10", "40", "-3"],
  ["", "", "", ""],
  //
  ["11/08/2024", "-2", "9", "30"],
  ["11/08/2024", "1", "12", "30"],
  ["11/08/2024", "37", "50", "30"],
];

export function Calculator() {
  const { cleanedData, rotationAmount, setRotationAmount } = useGlobal();

  const [tab, setTab] = useState("1");
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setFrame((prev) => (prev + 1) % LAST_FRAME);
  //   }, TIMEOUT_INTERVAL);

  //   return () => clearInterval(intervalId);
  // }, []);

  // const animationProgress = frame / LAST_FRAME;

  //   const interpolatedTimestamp = interpolate(
  //     minTimestamp,
  //     maxTimestamp,
  //     animationProgress
  //   );

  //   const interpolatedDate = (function () {
  //     const formattedDate = new Date(interpolatedTimestamp)
  //       .toLocaleDateString("en-US", {
  //         year: "numeric",
  //         month: "short",
  //         day: "numeric",
  //       })
  //       .replace(".", "");
  //     return formattedDate;
  //   })();

  //   const rangeMs = maxTimestamp - minTimestamp;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "scroll",
            padding: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "relative",
              height: 400,
              width: 400,
              margin: "auto",
              marginTop: 48,
              marginBottom: 48,
              flexShrink: 0,
            }}
          >
            <GlobeRotationGrid />

            <RotationPoints />
          </div>
          <div style={{ width: "50%", margin: "16px auto" }}>
            <Typography gutterBottom>{`Rotation ${(rotationAmount * 100)
              .toFixed(0)
              .toString()}%`}</Typography>
            <Slider
              min={0}
              max={100}
              value={rotationAmount * 100}
              onChange={(e, value) => {
                if (typeof value === "number") {
                  setRotationAmount(value / 100);
                }
              }}
              defaultValue={30}
            />
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            paddingTop: 16,
          }}
        >
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange}>
                <Tab label="Input" value="1" />
                <Tab label="Output" value="2" />
                <Tab label="Layers" value="3" />
              </TabList>
            </Box>
            <div style={{ flex: 1 }}>
              <TabPanel
                style={{
                  height: "100%",
                  width: "100%",
                  paddingRight: 16,
                  paddingLeft: 0,
                  paddingTop: 16,
                }}
                value="1"
              >
                <TableRotationInput />
              </TabPanel>
              <TabPanel
                style={{
                  height: "100%",
                  width: "100%",
                  paddingRight: 16,
                  paddingLeft: 0,
                  paddingTop: 16,
                }}
                value="2"
              >
                <TableRotationOutput />
              </TabPanel>
              <TabPanel value="3">
                <DatePoints />
              </TabPanel>
            </div>
          </TabContext>
        </div>
      </div>
    </div>
  );
}

function GlobeRotationGrid({}: {}) {
  let elems: JSX.Element[] = [];

  const LONGITUDE_RES = 128;
  const longitudes = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90];

  // draw longitude
  longitudes.forEach((long) => {
    const xAmt = degToPercent(long) ?? 0;

    for (let y = 0; y < LONGITUDE_RES; y++) {
      const yAmt = y / LONGITUDE_RES;
      const { px, py } = sphericalToPosition([xAmt, yAmt]);
      elems.push(<GridPoint px={px} py={py} />);
    }
  });

  const LATITUDE_RES = 128;
  const latitudes = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90];

  // draw latitude
  latitudes.forEach((lat) => {
    const yAmt = degToPercent(lat) ?? 0;

    for (let x = 0; x < LATITUDE_RES; x++) {
      const xAmt = x / LATITUDE_RES;
      const { px, py } = sphericalToPosition([xAmt, yAmt]);
      elems.push(<GridPoint px={px} py={py} />);
    }
  });

  return <div>{elems.map((elem) => elem)}</div>;
}

function GridPoint({ px, py }: { px: number; py: number }) {
  return (
    <div
      style={{
        width: 2,
        height: 2,
        borderRadius: "100%",
        background: GRID_COLOR,
        opacity: GRID_OPACITY,
        position: "absolute",
        top: `${py * 100}%`,
        left: `${px * 100}%`,
        transform: `translate(-50%, -50%)`,
      }}
    />
  );
}

export function toHue(value: number) {
  if (value < 0) throw new Error(`Value ${value} must be more than 0`);
  if (value > 1) throw new Error(`Value ${value} must be less than 1`);
  // map range 0-1 to 0-300
  const hue = 300 * value;
  const val = hue == null || isNaN(hue) ? 0 : hue;
  return `hsl(${val} 100% 50% / 1)`;
  // return `hsl(${hue} 100% 50% / 1)`;
}

function cleanRotationData(data: RotationData[]) {
  return data.filter((item) => {
    if (item.date == null) return false;
    if (isNaN(new Date(item.date).valueOf())) return false;
    if (item.lat == null || isNaN(item.lat)) return false;
    if (item.long == null || isNaN(item.long)) return false;
    if (item.rotation == null || isNaN(item.rotation)) return false;
    return true;
  });
}

function toRotationPoints(
  data: RotationData[],
  rotationAmount: number,
  rotationHiddenDates: number[]
) {
  const cleanedData = cleanRotationData(data);
  const [minDate, maxDate] = dateRange(cleanedData);

  const points: {
    hue: number;
    px: number;
    py: number;
    label: string;
  }[] = [];

  cleanedData.forEach((item) => {
    const sx = degToPercent(item.long);
    const sy = degToPercent(item.lat);
    const date = new Date(item.date).valueOf();
    const hue = (date - minDate) / (maxDate - minDate);
    if (sx == null) return;
    if (sy == null) return;
    const { px, py } = sphericalToPosition([sx, sy]);

    const rotated = rotatePoint({
      px: px,
      py: py,

      degrees: (item.rotation ?? 0) * rotationAmount,
    });

    const point = {
      px: rotated.px,
      py: rotated.py,
      hue,
      label: item.date,
    };

    if (rotationHiddenDates.includes(new Date(item.date).valueOf())) {
      return;
    }

    points.push(point);
  });

  return points;
}

function RotationPoints() {
  const { rotationAmount, rotationData, rotationHiddenDates } = useGlobal();

  const points = toRotationPoints(
    rotationData,
    rotationAmount,
    rotationHiddenDates
  );

  const elems = points.map(({ px, py, hue, label }) => {
    return (
      <>
        <div
          className="rotationSpot"
          style={{
            width: SPOT_SIZE,
            height: SPOT_SIZE,
            borderRadius: "100%",
            background: toHue(hue),
            position: "absolute",
            bottom: `${py * 100}%`,
            left: `${px * 100}%`,
            transform: `translate(-50%, 50%)`,
          }}
        >
          <div
            className="rotationSpotLabel"
            style={{
              position: "absolute",
              bottom: `calc(${py * 100}% + 4px)`,
              left: `calc(${px * 100}% - 8px)`,
            }}
          >
            {label}
          </div>
        </div>
      </>
    );
  });
  return <div>{elems}</div>;
}

function DatePoints() {
  const { rotationData, rotationHiddenDates, setRotationHiddenDates } =
    useGlobal();
  const cleanData = cleanRotationData(rotationData);
  const uniqueDates = Array.from(new Set(cleanData.map(({ date }) => date)));
  return (
    <div>
      {uniqueDates.map((date) => {
        const timestamp = new Date(date).valueOf();
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={!rotationHiddenDates.includes(timestamp)}
              onChange={() => {
                setRotationHiddenDates((s) =>
                  s.includes(timestamp)
                    ? s.filter((i) => i != timestamp)
                    : [...s, timestamp]
                );
              }}
            />
            <DateLink date={date} />
          </div>
        );
      })}
    </div>
  );
}

function DateLink({ date }: { date: string }) {
  const year = new Date(date).getFullYear();
  const month = new Date(date).getMonth() + 1;
  const day = new Date(date).getDate();

  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");

  const url = `https://sdo.gsfc.nasa.gov/data/dailymov/movie.php?q=${year}${paddedMonth}${paddedDay}_1024_HMIIF`;
  return (
    <div>
      <a
        target="sdo"
        style={{ color: "white" }}
        href={url}
      >{`${year}/${paddedMonth}/${paddedDay}`}</a>
    </div>
  );
}
