import HotTable from "@handsontable/react";

import { useGlobal } from "./useGlobal";
import { toRotationData } from "./pages/Calculator";
import { isDefined, RotationData } from "./helpers";

export function toRotationInputRows(data: RotationData[]): string[][] {
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

export function TableRotationInput() {
  const { rotationData, setUrlRotationData, refTableRotationInput } =
    useGlobal();

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
        ref={refTableRotationInput}
        data={toRotationInputRows(rotationData)}
        rowHeaders={true}
        colHeaders={["Date", "Latitude", "Longitude", "Rotation Degrees"]}
        afterChange={(_, source) => {
          if (source === "updateData") {
            // important. prevents an infinite loop after store is updated
            return;
          }
          if (!refTableRotationInput?.current) return;
          const allData = toRotationData(
            refTableRotationInput.current.hotInstance?.getData() as string[][]
          );
          if (!allData) return;
          setUrlRotationData(allData);
          //   const value = transformGridData(allData);
          //   if (!currentDeck?.id) return;
          //   setCardsStore(updateDeckInput(currentDeck?.id, value));
        }}
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
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      ></HotTable>
    </div>
  );
}
