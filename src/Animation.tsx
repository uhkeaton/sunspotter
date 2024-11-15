import { useEffect, useState } from "react";
import { Table } from "./Table";
import { Nav } from "./Nav";
import { useGlobal } from "./useGlobal";

// styles
const PROGRESS_WIDTH = 12;
const PROGRESS_COLOR = "#40c2d7";
const GRID_COLOR = "#40c2d7";
const GRID_OPACITY = 0.8;

// sunspot
const SPOT_COLOR = "#ff2600";
const SPOT_SIZE = 8;

// animation
const FPS = 30;
const ANIMATION_DURATION_MS = 5000;
const LAST_FRAME = FPS * (ANIMATION_DURATION_MS / 1000);
const TIMEOUT_INTERVAL = 1000 / FPS;

export type Data = {
  id: string;
  date: string;
  lat: number | null;
  long: number | null;
};

/** Map range [-90, 90] to [0, 1] */
function degToPercent(deg: number | null) {
  if (deg == null || isNaN(deg)) return null;
  return (deg + 90) / 180;
}

export const mockRows: string[][] = [
  ["A", "June 22, 2024", "15", "-60"],
  ["A", "June 23, 2024", "15", "-45"],
  ["A", "June 24, 2024", "15", "-32"],
  ["A", "June 25, 2024", "15", "-19"],
  ["A", "June 26, 2024", "15", "-11"],
  ["A", "June 27, 2024", "15", "7"],
  ["A", "June 28, 2024", "15", "22"],
  ["A", "June 29, 2024", "15", "34"],
  ["A", "June 30, 2024", "15", "44"],
  ["A", "July 1, 2024", "15", "61"],
  ["A", "July 2, 2024", "15", "75"],
  ["A", "July 3, 2024", "15", ""],
  //
  ["B", "June 22, 2024", "-30", "-60"],
  ["B", "June 23, 2024", "-30", "-45"],
  ["B", "June 24, 2024", "-30", "-32"],
  ["B", "June 25, 2024", "-30", "-19"],
  ["B", "June 26, 2024", "-30", "-11"],
  ["B", "June 27, 2024", "-30", "7"],
  ["B", "June 28, 2024", "-30", "22"],
  ["B", "June 29, 2024", "-30", "34"],
  ["B", "June 30, 2024", "-30", "44"],
  ["B", "July 1, 2024", "-30", "61"],
  ["B", "July 2, 2024", "-30", "75"],
  ["B", "July 3, 2024", "-30", ""],
  //
  ["C", "June 22, 2024", "0", "-60"],
  ["C", "June 23, 2024", "0", "-45"],
  ["C", "June 24, 2024", "0", "-32"],
  ["C", "June 25, 2024", "0", "-19"],
  ["C", "June 26, 2024", "0", "-11"],
  ["C", "June 27, 2024", "0", "7"],
  ["C", "June 28, 2024", "0", "22"],
  ["C", "June 29, 2024", "0", "34"],
  ["C", "June 30, 2024", "0", "44"],
  ["C", "July 1, 2024", "0", "61"],
  ["C", "July 2, 2024", "0", "75"],
  ["C", "July 3, 2024", "0", ""],
];

// const data: Data[] = rows.map(([id, date, lat, long]) => {
//   return { id, date, lat, long };
// });

function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function cleanData(data: Data[]) {
  return data.filter((item) => {
    if (!item.id) return false;
    if (item.date == null) return false;
    if (isNaN(new Date(item.date).valueOf())) return false;
    if (item.lat == null || isNaN(item.lat)) return false;
    if (item.long == null || isNaN(item.long)) return false;
    return true;
  });
}

export function toData(rows: string[][]): Data[] {
  return rows.map(([id, date, lat, long]) => {
    return {
      id: id,
      date: date,
      lat: parseFloat(lat),
      long: parseFloat(long),
    };
  });
}

export function toRows(data: Data[]): string[][] {
  return data
    .map(({ id, date, lat, long }) => {
      return [
        id,
        date,
        lat == null || isNaN(lat) ? "" : String(lat),
        long == null || isNaN(long) ? "" : String(long),
      ];
    })
    .filter(isDefined);
}

export function toFramePoints(data: Data[]) {
  const [minDate, maxDate] = dateRange(data);

  const uniqueIds = Array.from(new Set(data.map(({ id }) => id)));

  const frames = new Array(LAST_FRAME).fill(0).map((_, frame) => {
    const idCoords: { id: string; x: number; y: number }[] = [];

    uniqueIds.forEach((id) => {
      const idRows = data
        .filter((row) => {
          return (
            row.id === id &&
            row.lat != null &&
            row.long != null &&
            !isNaN(row.lat) &&
            !isNaN(row.long)
          );
        })
        .map((row) => {
          return {
            id: row.id,
            timestamp: new Date(row.date).valueOf(),
            x: degToPercent(row.long),
            y: degToPercent(row.lat),
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp);

      // TODO: use all of the rows instead of just
      // interpolating between the first and last rows
      // const firstRow = idRows[0];
      // const lastRow = idRows[idRows.length - 1];

      const animationProgress = frame / LAST_FRAME;
      const frameDate = interpolate(minDate, maxDate, animationProgress);

      const previousRows = idRows.filter(
        ({ timestamp }) => timestamp <= frameDate
      );
      const nextRows = idRows.filter(({ timestamp }) => timestamp >= frameDate);

      const prevRow = previousRows[previousRows.length - 1];
      const nextRow = nextRows[0];

      // donʻt show the point until there is data for it
      if (!prevRow || !nextRow) {
        return;
      }

      const amt =
        (frameDate - (prevRow?.timestamp ?? 0)) /
        ((nextRow?.timestamp ?? 0) - (prevRow?.timestamp ?? 0));

      // const deltaX =
      //   (firstRow.x ?? 0) +
      //   ((lastRow.x ?? 0) - (firstRow.x ?? 0)) * animationProgress;

      // const deltaX =
      //   (prevRow?.x ?? 0) +
      //   ((nextRow?.x ?? 0) - (prevRow?.x ?? 0)) * amt;

      const x = interpolate(
        prevRow?.x ?? 0,
        nextRow?.x ?? 0,
        isNaN(amt) ? 0 : Math.abs(amt)
      );

      const y = interpolate(
        prevRow?.y ?? 0,
        nextRow?.y ?? 0,
        isNaN(amt) ? 0 : Math.abs(amt)
      );

      idCoords.push({
        id: id,
        // x: prev?.x ?? 0,
        x: x,
        y: y,
      });
    });
    return idCoords;
  });
  return frames;
}

// const framePoints = toFramePoints(data);

function dateRange(data: Data[]) {
  const timestamps = data
    .map((item) => new Date(item.date).valueOf())
    .filter((item) => !isNaN(item));
  if (!timestamps.length) return [0, 0];
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  return [min, max];
}

function interpolate(min: number, max: number, percent: number) {
  if (percent < 0 || percent > 1) {
    throw new Error(`Invalid interpolation: ${percent}`);
  }
  const delta = max - min;
  return min + delta * percent;
}

function smooth(x: number) {
  return -(Math.cos(x * Math.PI) / 2) + 0.5;
}

export function Animation() {
  const { cleanedData } = useGlobal();
  const { isEdit } = useGlobal();
  const minTimestamp = dateRange(cleanedData)[0];
  const maxTimestamp = dateRange(cleanedData)[1];

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrame((prev) => (prev + 1) % LAST_FRAME);
    }, TIMEOUT_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const animationProgress = frame / LAST_FRAME;

  const interpolatedTimestamp = interpolate(
    minTimestamp,
    maxTimestamp,
    animationProgress
  );

  const interpolatedDate = (function () {
    const formattedDate = new Date(interpolatedTimestamp)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .replace(".", "");
    return formattedDate;
  })();

  const rangeMs = maxTimestamp - minTimestamp;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      <div
        style={{ display: "flex", justifyContent: "space-between", flex: 1 }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              position: "relative",
              height: 400,
              width: 400,
              margin: "auto",
              marginTop: 48,
              marginBottom: 48,
            }}
          >
            <Grid animationProgress={animationProgress} rangeMs={rangeMs} />
            <FramePoints frame={frame} />
          </div>
          <DateProgress text={interpolatedDate} percent={animationProgress} />
        </div>
        {isEdit && (
          <div style={{ flex: 1, padding: 16 }}>
            <Table />
          </div>
        )}
      </div>
    </div>
  );
}

function DateProgress({ text, percent }: { text: string; percent: number }) {
  return (
    <div style={{ margin: "auto", width: 400 }}>
      <div style={{ padding: 8 }}>{text}</div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: `100%`,
            background: PROGRESS_COLOR,
            height: PROGRESS_WIDTH,
            opacity: 0.2,
            borderRadius: PROGRESS_WIDTH / 2,
          }}
        />
        <div
          style={{
            width: `${percent * 100}%`,
            background: PROGRESS_COLOR,
            height: PROGRESS_WIDTH,
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: PROGRESS_WIDTH / 2,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Convert the percent progress around the arclength of a hemisphere to a
 * percent of the diameter traversed in one dimension
 *
 * @param percent - Percent of the arclength of a hemisphere from 0 to 1
 * @returns a percent of the diameter of the hemisphere from 0 to 1
 */
function toLinear(percent: number) {
  // percent 0 = -90 degrees
  // percent 1 = 90 degrees
  if (!(percent >= 0) && !(percent <= 1)) {
    throw new Error(`Percent ${percent} out of range.`);
  }

  return (1 - Math.cos(percent * Math.PI)) / 2;
}

function toLinearCoords(spherical: [number, number]) {
  const [px, py] = spherical;
  if (!(px >= 0) && !(px <= 1)) {
    throw new Error(`Percent x ${px} out of range.`);
  } else if (!(py >= 0) && !(py <= 1)) {
    throw new Error(`Percent y ${py} out of range.`);
  }

  const y = toLinear(py);

  const yOffset = Math.abs(2 * y - 1);
  const xOffset = Math.sqrt(1 - Math.pow(yOffset, 2));

  // for a given cartesian y, what are the x boundaries
  const xmin = 0.5 - xOffset / 2;
  const xmax = 1 - xmin;

  // interpolated
  const x = xmin + (xmax - xmin) * toLinear(px);
  return [x, y];
}

function FramePoints({ frame }: { frame: number }) {
  const { framePoints } = useGlobal();
  const points = framePoints[frame];
  const elems = points.map(({ id, x, y }) => {
    const [px, py] = toLinearCoords([x, y]);
    return (
      <>
        <div
          style={{
            width: SPOT_SIZE,
            height: SPOT_SIZE,
            borderRadius: "100%",
            background: SPOT_COLOR,
            position: "absolute",
            bottom: `${py * 100}%`,
            left: `${px * 100}%`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: `calc(${py * 100}% + 4px)`,
            left: `calc(${px * 100}% - 8px)`,
          }}
        >
          {id}
        </div>
      </>
    );
  });
  return <div>{elems}</div>;
}

function Grid({
  animationProgress,
  rangeMs,
}: {
  animationProgress: number;
  rangeMs: number;
}) {
  // The Sun rotates on its axis once every 27 days on average,
  // but the rate of rotation varies by latitude
  // Equator 24.47 days
  // Poles 34.3 days
  const AVG_DAYS_POLE_ROTATION = 34.3;
  const AVG_DAYS_EQUATOR_ROTATION = 24.47;
  const daysInAnimation = rangeMs / 1000 / 60 / 60 / 24;

  const poleRotationProgress =
    animationProgress * (daysInAnimation / AVG_DAYS_POLE_ROTATION);

  const equatorRotationProgress =
    animationProgress * (daysInAnimation / AVG_DAYS_EQUATOR_ROTATION);

  const COLS = 32;
  const ROWS = 100;
  const COL_WIDTH = 360 / COLS;

  let elems: JSX.Element[] = [];

  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const xOffset = (COL_WIDTH / 180) * x;
      const rowY = y / ROWS;

      const distFromEquator = 1 - Math.abs(rowY - 0.5) * 2;

      const colX =
        interpolate(
          poleRotationProgress,
          equatorRotationProgress,
          smooth(distFromEquator)
        ) *
          2 +
        xOffset;

      if (isNaN(colX)) {
        // continue;
        // debugger;
      }

      const [px, py] = toLinearCoords([colX, rowY]);
      if (colX % 2 > 1) {
        // don't render lines on the back side of the sphere
        continue;
      }
      elems.push(
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
          }}
        />
      );
    }
  }

  return <div>{elems.map((elem) => elem)}</div>;
}
