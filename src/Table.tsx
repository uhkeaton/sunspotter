import HotTable from "@handsontable/react";
import "./Table.css";

// https://handsontable.com/docs/react-data-grid/installation/
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import { toData, toRows } from "./Animation";
import { useGlobal } from "./useGlobal";
registerAllModules();

export function Table() {
  const { data, setUrlData, gridRef } = useGlobal();

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
        columns={[{}, {}, {}, {}]}
        ref={gridRef}
        data={toRows(data)}
        rowHeaders={true}
        colHeaders={["ID", "Date", "Latitude", "Longitude"]}
        afterChange={(_, source) => {
          if (source === "updateData") {
            // important. prevents an infinite loop after store is updated
            return;
          }
          if (!gridRef?.current) return;
          const allData = toData(
            gridRef.current.hotInstance?.getData() as string[][]
          );
          if (!allData) return;
          setUrlData(allData);
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
      />
    </div>
  );
}
