import HotTable, { HotColumn } from "@handsontable/react";
import "./Table.css";

// https://handsontable.com/docs/react-data-grid/installation/
import "handsontable/dist/handsontable.full.min.css";
import { useGlobal } from "./useGlobal";
import {
  degToPercent,
  isDefined,
  percentToDeg,
  positionToSpherical,
  rotatePoint,
  RotationData,
  sphericalToPosition,
} from "./helpers";

export function toRotationOutputRows(
  data: RotationData[],
  rotationAmount: number
): string[][] {
  return data
    .map(({ date, lat, long, rotation }) => {
      const sx = degToPercent(long) ?? 0;
      const sy = degToPercent(lat) ?? 0;
      const { px, py } = sphericalToPosition([sx, sy]);

      const degrees = (rotation ?? 0) * rotationAmount;

      const { px: rotatedPx, py: rotatedPy } = rotatePoint({
        px: px,
        py: py,

        degrees: degrees,
      });

      const { sx: rotatedSx, sy: rotatedSy } = positionToSpherical(
        rotatedPx,
        rotatedPy
      );

      const rotatedLat = percentToDeg(rotatedSy);
      const rotatedLong = percentToDeg(rotatedSx);

      return [
        date,
        rotatedLat == null || isNaN(rotatedLat)
          ? ""
          : String(rotatedLat.toFixed(2)),
        rotatedLong == null || isNaN(rotatedLong)
          ? ""
          : String(rotatedLong.toFixed(2)),
        degrees == null || isNaN(degrees) ? "" : String(degrees.toFixed(2)),
      ];
    })
    .filter(isDefined);
}

export function TableRotationOutput() {
  const {
    rotationData,
    setUrlRotationData,
    refTableRotationOutput,
    rotationAmount,
  } = useGlobal();

  return (
    <div
      style={{
        height: "calc(100% - 16px)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <HotTable
        className={"htDark"}
        afterGetColHeader={(_, TH) => {
          TH.className = "darkTH";
        }}
        afterGetRowHeader={(_, RH) => {
          RH.className = "darkRH";
        }}
        minRows={10}
        // columns={[{}, {}, {}, {}]}
        ref={refTableRotationOutput}
        data={toRotationOutputRows(rotationData, rotationAmount)}
        rowHeaders={true}
        colHeaders={[
          "Date",
          "New Latitude",
          "New Longitude",
          "Applied Rotation",
        ]}
        // height="auto"
        stretchH={"all"}
        // stretchH={"last"}
        colWidths={["25%", "25%", "25%", "25%"]}
        // manualColumnResize={true}
        height={"100%"}
        width={"100%"}
        style={{
          zIndex: 0,
        }}
        allowInsertColumn={false}
        allowInsertRow={true}
        allowEmpty={true}
        autoWrapRow={true}
        autoWrapCol={true}
        readOnly={true}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      ></HotTable>
    </div>
  );
}
