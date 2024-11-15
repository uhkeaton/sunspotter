import { Button } from "@mui/material";
import { useGlobal } from "./useGlobal";
import { mockRows, toData } from "./Animation";

export function Nav() {
  const { isEdit, setIsEdit, setUrlData, addRows, deleteRow } = useGlobal();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: 16,
        paddingBottom: 0,
      }}
    >
      {isEdit && (
        <div style={{ margin: 8 }}>
          <Button
            variant="outlined"
            onMouseDown={() => setUrlData(toData(mockRows))}
          >
            USE EXAMPLE DATA
          </Button>
        </div>
      )}
      {isEdit && (
        <div style={{ margin: 8 }}>
          <Button variant="outlined" onMouseDown={() => addRows()}>
            ADD ROW
          </Button>
        </div>
      )}
      {isEdit && (
        <div style={{ margin: 8 }}>
          <Button variant="outlined" onMouseDown={() => deleteRow()}>
            DELETE ROW
          </Button>
        </div>
      )}
      <div style={{ margin: 8 }}>
        <Button variant="outlined" onMouseDown={() => setIsEdit((s) => !s)}>
          {isEdit ? "Done" : "Edit Data"}
        </Button>
      </div>
    </div>
  );
}
