export type Data = {
  id: string;
  date: string;
  lat: number | null;
  long: number | null;
};

export type RotationData = {
  date: string;
  lat: number | null;
  long: number | null;
  rotation: number | null;
};

export function dateRange<T extends { date: string }>(data: T[]) {
  const timestamps = data
    .map((item) => new Date(item.date).valueOf())
    .filter((item) => !isNaN(item));
  if (!timestamps.length) return [0, 0];
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  return [min, max];
}

export function interpolate(min: number, max: number, percent: number) {
  if (percent < 0 || percent > 1) {
    throw new Error(`Invalid interpolation: ${percent}`);
  }
  const delta = max - min;
  return min + delta * percent;
}

/**
 * Convert the percent progress around the arclength of a hemisphere to a
 * percent of the diameter traversed in one dimension
 *
 * @param percent - Percent of the arclength of a hemisphere from 0 to 1
 * @returns a percent of the diameter of the hemisphere from 0 to 1
 */
export function arcToPos(percent: number) {
  // percent 0 = -90 degrees
  // percent 1 = 90 degrees
  if (!(percent >= 0) && !(percent <= 1)) {
    throw new Error(`Percent ${percent} out of range.`);
  }

  return (1 - Math.cos(percent * Math.PI)) / 2;
}

function posToArc(percent: number) {
  return Math.acos(1 - 2 * percent) / Math.PI;
}

export function sphericalToPosition(spherical: [number, number]) {
  const [sx, sy] = spherical;
  if (!(sx >= 0) && !(sx <= 1)) {
    throw new Error(`Percent x ${sx} out of range.`);
  } else if (!(sy >= 0) && !(sy <= 1)) {
    throw new Error(`Percent y ${sy} out of range.`);
  }

  const py = arcToPos(sy);

  // range from [0, 1] being 0 at the center and 1 at the poles
  const yOffsetAmtFromCenter = Math.abs(2 * py - 1);

  const widthOfLatitude = Math.sqrt(1 - Math.pow(yOffsetAmtFromCenter, 2));

  // for a given cartesian y, what are the x boundaries
  const xmin = 0.5 - widthOfLatitude / 2;
  const xmax = 1 - xmin;

  // interpolated
  const px = xmin + (xmax - xmin) * arcToPos(sx);
  return { px, py };
}

// Converts normalized x, y back to latitude and longitude
export function positionToSpherical(
  px: number,
  py: number
): { sy: number; sx: number } {
  // const lat = percentToDeg(py) ?? 0;
  const sy = posToArc(py);

  // range from [0, 1] being 0 at the center and 1 at the poles
  const yOffsetAmtFromCenter = Math.abs(2 * py - 1);

  const widthOfLatitude = Math.sqrt(1 - Math.pow(yOffsetAmtFromCenter, 2));

  // for a given latitude y, what are the x boundaries
  const xmin = 0.5 - widthOfLatitude / 2;
  const xmax = 1 - xmin;

  // interpolated
  const percentOfDiameter = (px - xmin) / (xmax - xmin);

  const sx = posToArc(percentOfDiameter);

  return { sy, sx };
}

/** Map range [-90, 90] to [0, 1] */
export function degToPercent(deg: number | null) {
  if (deg == null || isNaN(deg)) return null;
  return (deg + 90) / 180;
}

/** Map range [0, 1] to [-90, 90] */
export function percentToDeg(deg: number | null) {
  if (deg == null || isNaN(deg)) return null;
  return 180 * deg - 90;
}

export function isDefined<T>(
  value: T | null | undefined
): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
