import HotTable, { HotColumn } from "@handsontable/react";
import "./Table.css";

// https://handsontable.com/docs/react-data-grid/installation/
import "handsontable/dist/handsontable.full.min.css";
import { useGlobal } from "./useGlobal";
import { isDefined, RotationData } from "./helpers";

export function toRotationOutputRows(
  data: RotationData[],
  rotationAmount: number
): string[][] {
  return data
    .map(({ date, lat, long, rotation }) => {
      return [
        date,
        lat == null || isNaN(lat) ? "" : String(lat),
        long == null || isNaN(long) ? "" : String(long),
        rotation == null || isNaN(rotation) ? "" : String(rotation),
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
