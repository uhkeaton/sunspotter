import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cleanData, mockRows, toData, toFramePoints } from "./Animation";
import { HotTableClass } from "@handsontable/react";
import { Data, RotationData } from "./helpers";
import { mockRotationRows, toRotationData } from "./pages/Calculator";

// https://kentcdodds.com/blog/how-to-use-react-context-effectively
const GlobalContext = React.createContext<GlobalContextValue | undefined>(
  undefined
);

const URL_KEY_DATA = "data";

export function urlDecodeData(str: string | null): Data[] {
  if (!str) return [];
  return JSON.parse(decodeURIComponent(str));
}

export function urlEncodeData(data: Data[]) {
  return encodeURIComponent(JSON.stringify(data));
}

function useGlobalContext() {
  const gridRef = useRef<HotTableClass | null>(null);
  const refTableRotationInput = useRef<HotTableClass | null>(null);
  const refTableRotationOutput = useRef<HotTableClass | null>(null);

  let [searchParams, setSearchParams] = useSearchParams();

  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<Data[]>(toData(mockRows));

  const cleanedData = useMemo(() => cleanData(data), [data]);

  const framePoints = useMemo(() => toFramePoints(cleanedData), [cleanedData]);

  useEffect(() => {
    const str = searchParams.get("data");
    const decoded = urlDecodeData(str);
    if (decoded.length) setData(decoded);
  }, []);

  const setUrlData = (data: Data[]) => {
    setData(data);
    setSearchParams({
      [URL_KEY_DATA]: urlEncodeData(data),
    });
  };

  const addRow = () => {
    const blank = { id: "", date: "", lat: NaN, long: NaN };

    const newData: Data[] = [...data, blank];

    setData(newData);

    setSearchParams({
      [URL_KEY_DATA]: urlEncodeData(newData),
    });

    // scroll to bottom
    const hotInstance = gridRef.current?.hotInstance;
    hotInstance?.scrollViewportTo({ row: data.length - 1 });
  };

  const deleteRow = () => {
    const newData: Data[] = data.slice(0, -1);

    setData(newData);

    setSearchParams({
      [URL_KEY_DATA]: urlEncodeData(newData),
    });

    // scroll to bottom
    const hotInstance = gridRef.current?.hotInstance;
    hotInstance?.scrollViewportTo({ row: data.length - 1 });
  };

  // ##### START ROTATION SECTION #####
  // ##### START ROTATION SECTION #####
  // ##### START ROTATION SECTION #####

  const [rotationAmount, setRotationAmount] = useState<number>(1);
  const [rotationHiddenDates, setRotationHiddenDates] = useState<number[]>([]);

  const [rotationData, setRotationData] = useState<RotationData[]>(
    toRotationData(mockRotationRows)
  );

  const setUrlRotationData = (data: RotationData[]) => {
    setRotationData(data);
    // setSearchParams({
    //   [URL_KEY_DATA]: urlEncodeData(data),
    // });
  };

  // ##### END ROTATION SECTION #####
  // ##### END ROTATION SECTION #####
  // ##### END ROTATION SECTION #####

  return {
    isEdit,
    setIsEdit,
    cleanedData,
    data,
    framePoints,
    setUrlData,
    addRows: addRow,
    deleteRow,
    gridRef,
    // #####  ROTATION SECTION #####
    refTableRotationInput,
    refTableRotationOutput,
    rotationData,
    setUrlRotationData,
    rotationAmount,
    setRotationAmount,
    rotationHiddenDates,
    setRotationHiddenDates,
  };
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const value = useGlobalContext();

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

type GlobalContextValue = ReturnType<typeof useGlobalContext>;

export function useGlobal() {
  const context = React.useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
