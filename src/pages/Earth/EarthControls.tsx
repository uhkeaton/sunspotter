import { Divider, Slider, TextField, Typography } from "@mui/material";
import { DATE_SLIDER_MAX, DATE_SLIDER_MIN, useEarth } from "./useEarth";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;
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
  const { observerLat, setObserverLat, setTimestamp, timestamp } = useEarth();
  return (
    <div style={{ width: 200 }}>
      {/* <Typography fontSize={12}>{new Date(timestamp)}</Typography> */}

      <div>
        <DatePicker
          label="Local Date"
          value={new Date(timestamp)}
          // onChange={(newValue) => setValue(newValue)}
        />
      </div>
      {/* <StaticTimePicker
        displayStaticWrapperAs="mobile"
        value={new Date(timestamp)}
        // onChange={(newValue) => {
        //   setValue(newValue);
        // }}
        // renderInput={(params) => <TextField {...params} />}
      /> */}
      <TimePicker label="Local Time" value={new Date(timestamp)} />
      <div>
        <Typography fontSize={12}>Day</Typography>
        <Slider
          min={DATE_SLIDER_MIN}
          max={DATE_SLIDER_MAX}
          value={timestamp}
          step={MS_PER_DAY}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setTimestamp(value);
            }
          }}
          defaultValue={DATE_SLIDER_MIN}
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
          defaultValue={DATE_SLIDER_MIN}
        />
      </div>
      <Divider />
      <div>
        <Typography fontSize={12}>Lat</Typography>
        <Slider
          min={-90}
          max={90}
          value={observerLat}
          onChange={(_, value) => {
            if (typeof value === "number") {
              setObserverLat(value);
            }
          }}
          defaultValue={30}
        />
      </div>
    </div>
  );
}
