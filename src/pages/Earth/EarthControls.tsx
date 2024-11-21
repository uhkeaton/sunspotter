import { Divider, Slider, Typography } from "@mui/material";
import { useEarth } from "./useEarth";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
  const { observerLocation, setObserverLocation, setTimestamp, timestamp } =
    useEarth();

  const handleChange = (newValue: Date | null) => {
    const value = newValue?.getTime();
    if (value != null && !isNaN(value)) {
      newValue && setTimestamp(newValue.valueOf());
    }
  };

  return (
    <div style={{ width: 200 }}>
      {/* <Typography fontSize={12}>{new Date(timestamp)}</Typography> */}

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
        <Typography fontSize={12}>Date</Typography>
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
          defaultValue={timestamp}
        />
      </div>
      <div>
        <Typography fontSize={12}>Time</Typography>
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
          defaultValue={timestamp}
        />
      </div>
      <Divider />
      <div>
        <Typography fontSize={12}>Observer Latitude</Typography>
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
      <div>
        <Typography fontSize={12}>Observer Longitude</Typography>
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
      </div>
    </div>
  );
}
