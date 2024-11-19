import { Body, Equator, Observer, SiderealTime } from "astronomy-engine";
// import { Angle, Location, Time } from "astronomy-engine";

// https://rl.se/zenithold.php
// https://theskylive.com/where-is-sun#:~:text=The%20Sun%20is%20currently%20in,19%C2%B0%2017'%2011%E2%80%9D%20.
// https://www.skymarvels.com/infopages/vids/Earth%20-%20Sub-solar%20Point%20001.htm
// https://www.heavens-above.com/sun.aspx

export function getSunRAandDec(date: Date): { RA: number; Dec: number } {
  // Get the Sun's equatorial coordinates for the specified date

  const observer = new Observer(0, 0, 0);
  const equatorCoords = Equator(Body.Sun, date, observer, false, false);

  // Right Ascension
  const RA = equatorCoords.ra;

  // Declination (Dec) in degrees
  const Dec = equatorCoords.dec;

  return { RA, Dec };
}

//
//
//

//
//
//

// Constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function latLonToEquatorialCoordinates(lat: number, lon: number, gast: number) {
  // Convert latitude and longitude to radians
  const latRad = lat * DEG_TO_RAD;
  const lonRad = lon * DEG_TO_RAD;

  // Convert GAST to radians (GAST is in hours, so we convert it to degrees and then to radians)
  const gastRad = gast * 15 * DEG_TO_RAD;

  // Calculate the Local Sidereal Time (LST) in radians
  const lst = gastRad + lonRad;

  // Calculate the Right Ascension (RA) and Declination (Dec)
  // Assuming declination is 0 (object is on the celestial equator)
  // RA = LST and Dec = latitude (since we're at the celestial equator)
  const ra = lst; // Right Ascension in radians
  const dec = latRad; // Declination in radians

  // Convert RA and Dec to degrees
  const raDeg = ra * RAD_TO_DEG;
  const decDeg = dec * RAD_TO_DEG;

  // Return the results
  return {
    rightAscension: raDeg, // in degrees
    declination: decDeg, // in degrees
  };
}

// Example usage
const lat = 19.5; // Latitude of the observer in degrees (e.g., 40° North)
const long = 178.9; // Longitude of the observer in degrees (e.g., 75° West)

const gast = SiderealTime(new Date());

const { rightAscension, declination } = latLonToEquatorialCoordinates(
  lat,
  long,
  gast
);

console.log("Right Ascension:", rightAscension, "degrees");
console.log("Declination:", declination, "degrees");
