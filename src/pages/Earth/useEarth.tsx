import { Body, Equator, Observer, SiderealTime } from "astronomy-engine";

import React, { useEffect, useMemo, useState } from "react";
import { ECLIPTIC_TILT_DEGREES } from "./Earth3D";

export const SUN_INITIAL_POSITION = [3, 0, 0];

export type Vector3D = { x: number; y: number; z: number };
export type GeographicLocation = { lat: number; long: number };
export type EquatorialCoords = { ra: number; dec: number };

function findSignedAngleBetweenVectors(u: Vector3D, v: Vector3D): number {
  //  dot product
  const dotProduct = u.x * v.x + u.y * v.y + u.z * v.z;

  //  magnitudes
  const magnitudeU = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2);
  const magnitudeV = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);

  //  cosine of the angle
  const cosTheta = dotProduct / (magnitudeU * magnitudeV);

  // Handle potential floating-point precision issues
  const clampedCosTheta = Math.min(1, Math.max(-1, cosTheta));

  //  angle in radians
  const angleRadians = Math.acos(clampedCosTheta);

  // Compute cross product to determine the sign
  const crossProduct = {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x,
  };

  // Determine the sign using a reference axis (e.g., the Z-axis)
  const referenceAxis = { x: 0, y: 0, z: 1 }; // Modify if needed
  const sign = Math.sign(
    crossProduct.x * referenceAxis.x +
      crossProduct.y * referenceAxis.y +
      crossProduct.z * referenceAxis.z
  );

  //  signed angle in degrees
  const angleDegrees = (angleRadians * 180) / Math.PI;
  return angleDegrees * sign;
}

export function crossProduct(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y, // x-component
    y: a.z * b.x - a.x * b.z, // y-component
    z: a.x * b.y - a.y * b.x, // z-component
  };
}

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

export function toThreeVector(vector: Vector3D): Vector3D {
  return {
    x: vector.x,
    // switch y and z directions
    // switch y and z directions
    y: vector.z,
    z: vector.y,
  };
}

export function scaleVector(vector: Vector3D, scale: number): Vector3D {
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

// function rotatePointY(
//   x: number,
//   y: number,
//   z: number,
//   n: number
// ): { x: number; y: number; z: number } {
//   const radians = (n * Math.PI) / 180;

//   const newX = x * Math.cos(radians) - z * Math.sin(radians);
//   const newZ = x * Math.sin(radians) + z * Math.cos(radians);

//   return { x: newX, y: y, z: newZ };
// }

function getSunAndEarth(date: Date) {
  const { sunRA, sunDec } = getSunRAandDec(date);

  const GASTDeg = SiderealTime(date) * 15;

  const sunRADeg = sunRA * 15;

  const sunPos = scaleVector(
    toThreeVector(geographicToCartesian({ lat: sunDec, long: -sunRADeg })),
    3
  );

  return {
    sunRADeg,
    sunDec,
    earthRotationDeg: GASTDeg,
    sunPosition: sunPos,
  };
}

function getObserverEquatorialCoords(
  observerLocation: GeographicLocation,
  earthRotationDeg: number,
  sunPosition: Vector3D
) {
  const { lat, long } = observerLocation;
  const observerDec = lat;
  const observerRADeg = -earthRotationDeg - long;

  const observerPosition = toThreeVector(
    geographicToCartesian({ lat: observerDec, long: observerRADeg })
  );

  const observerSunCross = crossProduct(observerPosition, sunPosition);

  const eclipticTiltVector = geographicToCartesian({
    lat: ECLIPTIC_TILT_DEGREES,
    long: 90,
  });

  const eclipticTiltSunCross = crossProduct(eclipticTiltVector, sunPosition);

  const sunDiskImageCorrectionDeg = findSignedAngleBetweenVectors(
    observerSunCross,
    eclipticTiltSunCross
  );

  console.log({ sunDiskImageCorrectionDeg });

  return {
    observerDec,
    observerRADeg,
    observerPosition,
    observerSunCross,
    eclipticTiltSunCross,
    sunDiskImageCorrectionDeg,
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

  const {
    sunRADeg,
    sunDec,
    earthRotationDeg,
    sunPosition,
    observerDec,
    observerRADeg,
    observerPosition,
    observerSunCross,
    eclipticTiltSunCross,
    sunDiskImageCorrectionDeg,
  } = useMemo(() => {
    const { sunRADeg, sunDec, earthRotationDeg, sunPosition } = getSunAndEarth(
      new Date(timestamp)
    );

    const {
      observerDec,
      observerRADeg,
      observerPosition,
      observerSunCross,
      eclipticTiltSunCross,
      sunDiskImageCorrectionDeg,
    } = getObserverEquatorialCoords(
      observerLocation,
      earthRotationDeg,
      sunPosition
    );

    return {
      sunRADeg,
      sunDec,
      earthRotationDeg,
      sunPosition,
      observerDec,
      observerRADeg,
      observerPosition,
      observerSunCross,
      eclipticTiltSunCross,
      sunDiskImageCorrectionDeg,
    };
  }, [timestamp, observerLocation]);

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
    sunPosition,
    observerDec,
    observerRADeg,
    observerPosition,
    observerSunCross,
    eclipticTiltSunCross,
    sunDiskImageCorrectionDeg,
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
