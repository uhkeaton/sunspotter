import { Divider, Slider, Typography } from "@mui/material";
import { useEarth } from "./useEarth";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { EarthControlsMenu } from "./EarthControlsMenu";
import { SUNSPOTS_GIF_PATH } from "../../Nav";
import { NorthArrowSvg } from "./NorthArrowSvg";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

function startOfYear(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

function endOfYear(timestamp: number) {
  const date = new Date(timestamp);
  const nextYear = date.getFullYear() + 1;
  const startOfNext = new Date(nextYear, 0, 0, 0, 0, 0, 0);
  // start of next - 1 ms
  return new Date(startOfNext.valueOf() - 1);
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

export function EarthControls() {
  const {
    observerLocation,
    setObserverLocation,
    setTimestamp,
    timestamp,
    solarDiskRotationDeg,
  } = useEarth();

  const handleChange = (newValue: Date | null) => {
    const value = newValue?.getTime();
    if (value != null && !isNaN(value)) {
      newValue && setTimestamp(newValue.valueOf());
    }
  };

  return (
    <div style={{ width: 200 }}>
      {/* <Typography fontSize={12}>{new Date(timestamp)}</Typography> */}
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <div
          style={{
            marginBottom: 8,
            paddingRight: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SunDisk />
          <EarthControlsMenu />
        </div>
        <Typography
          fontSize={16}
        >{`Solar Disk Rotation: ${solarDiskRotationDeg.toFixed(
          0
        )}°`}</Typography>
      </div>
      <div style={{ marginBottom: 16 }}>
        <DatePicker
          label="Date"
          value={new Date(timestamp)}
          onChange={handleChange}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <TimePicker
          label="Time"
          value={new Date(timestamp)}
          onChange={handleChange}
        />
      </div>
      <div>
        <Typography fontSize={16}>Date</Typography>
        <Slider
          min={startOfYear(timestamp).valueOf()}
          max={endOfYear(timestamp).valueOf()}
          value={timestamp}
          step={MS_PER_DAY}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setTimestamp(value);
            }
          }}
          // defaultValue={timestamp}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Typography fontSize={16}>Time</Typography>
        <Slider
          min={startOfDay(timestamp).valueOf()}
          max={endOfDay(timestamp).valueOf()}
          value={timestamp}
          step={MS_PER_MINUTE}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setTimestamp(value);
            }
          }}
          // defaultValue={timestamp}
        />
        <Divider />
      </div>

      <div>
        <Typography fontSize={16}>{`Latitude: ${observerLocation.lat.toFixed(
          0
        )}°`}</Typography>
        <Slider
          min={-90}
          max={90}
          value={observerLocation.lat}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setObserverLocation(({ long }) => ({ lat: value, long }));
            }
          }}
          defaultValue={30}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Typography fontSize={16}>{`Longitude: ${observerLocation.long.toFixed(
          0
        )}°`}</Typography>
        <Slider
          min={-180}
          max={180}
          value={observerLocation.long}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setObserverLocation(({ lat }) => ({ lat, long: value }));
            }
          }}
          defaultValue={30}
        />
        <Divider />
      </div>
    </div>
  );
}

function SunDisk() {
  const { solarDiskRotationDeg } = useEarth();
  const SIZE = 64;
  const SUN_SIZE = 64;
  const ARROW_SIZE = 24;
  return (
    <div>
      <div
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE,
          transform: `rotate(${solarDiskRotationDeg}deg)`,
        }}
      >
        <img
          style={{
            position: "absolute",
            width: SUN_SIZE,
            marginRight: 16,
            left: SIZE / 2 - SUN_SIZE / 2,
            top: (SIZE - SUN_SIZE) / 2,
          }}
          src={SUNSPOTS_GIF_PATH}
        />
        <NorthArrowSvg
          size={ARROW_SIZE}
          style={{
            position: "absolute",
            top: 4,
            left: SIZE / 2 - ARROW_SIZE / 2,
            color: "#a50000",
          }}
        />
      </div>
    </div>
  );
}
