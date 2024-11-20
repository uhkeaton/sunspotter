import { Body, Equator, Observer, SiderealTime } from "astronomy-engine";
import React, { useMemo, useState } from "react";

export const SUN_INITIAL_POSITION = [3, 0, 0];

export function getSunRAandDec(date: Date) {
  // Get the Sun's equatorial coordinates for the specified date

  const observer = new Observer(0, 0, 0);
  const equatorCoords = Equator(Body.Sun, date, observer, false, false);

  // Right Ascension
  const sunRA = equatorCoords.ra;

  // Declination (Dec) in degrees
  const sunDec = equatorCoords.dec;

  return { sunRA, sunDec };
}

function rotatePointY(
  x: number,
  y: number,
  z: number,
  n: number
): { x: number; y: number; z: number } {
  const radians = (n * Math.PI) / 180;

  const newX = x * Math.cos(radians) - z * Math.sin(radians);
  const newZ = x * Math.sin(radians) + z * Math.cos(radians);

  return { x: newX, y: y, z: newZ };
}

function getSunAndEarth(date: Date) {
  const { sunRA, sunDec } = getSunRAandDec(date);
  const gast = SiderealTime(date);
  console.log({ gast, date: date.toISOString() });

  const sunRADeg = sunRA * 15;
  const [sunX, sunY, sunZ] = SUN_INITIAL_POSITION;
  const sunPos = rotatePointY(sunX, sunY, sunZ, -sunRADeg);

  return {
    sunRADeg,
    sunDec,
    earthRotationDeg: (gast/60) * 15,
    sunPos,
  };
}

// https://kentcdodds.com/blog/how-to-use-react-context-effectively
const EarthContext = React.createContext<EarthContextValue | undefined>(
  undefined
);

export const DATE_SLIDER_MIN = new Date(
  Date.UTC(2024, 0, 0, 0, 0, 0)
).valueOf();

export const DATE_SLIDER_MAX = new Date(
  Date.UTC(2025, 0, 0, 0, 0, 0)
).valueOf();

function useEarthContext() {
  // const date = new Date();
  const [timestamp, setTimestamp] = useState<number>(DATE_SLIDER_MIN);

  const [observerLat, setObserverLat] = useState(0);

  const { sunRADeg, sunDec, earthRotationDeg, sunPos } = useMemo(() => {
    return getSunAndEarth(new Date(timestamp));
  }, [timestamp]);

  return {
    observerLat,
    setObserverLat,
    timestamp,
    setTimestamp,
    sunRADeg,
    sunDec,
    earthRotationDeg,
    sunPos,
  };
}

export function EarthProvider({ children }: { children: React.ReactNode }) {
  const value = useEarthContext();

  return (
    <EarthContext.Provider value={value}>{children}</EarthContext.Provider>
  );
}

type EarthContextValue = ReturnType<typeof useEarthContext>;

export function useEarth() {
  const context = React.useContext(EarthContext);
  if (context === undefined) {
    throw new Error("useEarth must be used within a EarthProvider");
  }
  return context;
}
