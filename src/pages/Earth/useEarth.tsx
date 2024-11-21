import {
  Body,
  Equator,
  GeoVector,
  Observer,
  SiderealTime,
} from "astronomy-engine";

import React, { useEffect, useMemo, useState } from "react";

export const SUN_INITIAL_POSITION = [3, 0, 0];

export type SimpleVector = { x: number; y: number; z: number };
export type GeographicLocation = { lat: number; long: number };

export function geographicToCartesian({ lat, long }: GeographicLocation) {
  //  degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (long * Math.PI) / 180;

  // radius
  const R = 1;

  const x = R * Math.cos(latRad) * Math.cos(lonRad);
  const y = R * Math.cos(latRad) * Math.sin(lonRad);
  const z = R * Math.sin(latRad);

  return { x, y, z };
}

export function toThreeVector(vector: SimpleVector): SimpleVector {
  return {
    x: vector.x,
    // switch y and z directions
    // switch y and z directions
    y: vector.z,
    z: vector.y,
  };
}

export function scaleVector(vector: SimpleVector, scale: number): SimpleVector {
  return {
    x: vector.x * scale,
    y: vector.y * scale,
    z: vector.z * scale,
  };
}

export function getSunRAandDec(date: Date) {
  // Get the Sun's equatorial coordinates for the specified date

  const observer = new Observer(90, 90, 0);
  const equatorCoords = Equator(Body.Sun, date, observer, true, false);

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
  const gastDeg = SiderealTime(date) * 15;

  console.log(sunRA, sunDec, gastDeg);
  // console.log(gastDeg);

  const sunRADeg = sunRA * 15;
  const [sunX, sunY, sunZ] = SUN_INITIAL_POSITION;

  // const sunPos = rotatePointY(sunX, sunY, sunZ, -sunRADeg);
  const sunPos = scaleVector(
    toThreeVector(geographicToCartesian({ lat: sunDec, long: -sunRADeg })),
    3
  );

  // const sunPosAE = scaleVector(
  //   toThreeVector(GeoVector(Body.Sun, date, false)),
  //   3
  // );

  // console.log(sunPosAE, sunPosAENeg);

  return {
    sunRADeg,
    sunDec,
    earthRotationDeg: gastDeg,
    sunPosAE: sunPos,
  };
}

// https://kentcdodds.com/blog/how-to-use-react-context-effectively
const EarthContext = React.createContext<EarthContextValue | undefined>(
  undefined
);

const NOW = new Date().valueOf();

// https://data.giss.nasa.gov/modelE/ar5plots/srvernal.html
const VERNAL_EQUINOX = new Date("2024-03-20T03:06:00Z").valueOf();

function useEarthContext() {
  // const date = new Date();
  const [timestamp, setTimestamp] = useState<number>(VERNAL_EQUINOX);
  const [observerLocation, setObserverLocation] = useState<GeographicLocation>({
    lat: 0,
    long: 0,
  });

  const { sunRADeg, sunDec, earthRotationDeg, sunPosAE } = useMemo(() => {
    return getSunAndEarth(new Date(timestamp));
  }, [timestamp]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setObserverLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
        console.log(position.coords);
      });
    }
  }, []);

  return {
    observerLocation,
    setObserverLocation,
    timestamp,
    setTimestamp,
    sunRADeg,
    sunDec,
    earthRotationDeg,
    sunPosAE,
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
