import { useQuery } from "@tanstack/react-query";
import { getSunRAandDec } from "./pages/Earth/useEarth";

// function parseHorizonsResponse(text: string) {
//   const lines = text.split("/n");
//   console.log(lines);
// }

async function getCelestialCoordinatesOfSun() {
  const url = "https://ssd.jpl.nasa.gov/api/horizons.api";

  // time in ISO string
  const startTime = new Date().toISOString();

  // one second later - the api requires an end date
  const endTime = new Date(new Date(startTime).valueOf() + 1000).toISOString();

  const params = new URLSearchParams({
    format: "text",
    COMMAND: "'10'", // Sun
    CENTER: "'coord@399'", // Observer on Earth
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "OBSERVER",
    START_TIME: startTime,
    STOP_TIME: endTime, // one second later
    // STEP_SIZE: "1d", // 1 - day interval
    // https://ssd.jpl.nasa.gov/horizons/manual.html#frames
    QUANTITIES: "'1,31'", // Angular coordinates and pole position angle
    REF_PLANE: "ECLIPTIC", // Reference plane for coordinates
    CSV_FORMAT: "YES",
  });

  console.log("Fetching");

  // const EXAMPLE_URL =
  //   "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='499'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='2006-01-01'&STOP_TIME='2006-01-20'&STEP_SIZE='1%20d'&QUANTITIES='1,9,20,23,24,29'";

  const response = await fetch(`${url}?${params}`, {
    method: "GET",
    mode: "no-cors",
    // the response is opaque, meaning it cannot be used in javascript
    // we can use the response to visually check the output of the functions though
    // mode: "cors",
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin:": "*",
    },
  });

  // Example usage:
  const date = new Date(startTime);
  const { RA, Dec } = getSunRAandDec(date);
  console.log(`Right Ascension: ${RA.toFixed(4)} hours`);
  console.log(`Right Ascension: ${(RA * 15).toFixed(4)} degrees`);
  console.log(`Declination: ${Dec.toFixed(4)}°`);

  //   console.log(`Current subsolar point:`);

  //   parseHorizonsResponse(response);
}

export function Todos() {
  // Access the client
  // const queryClient = useQueryClient();

  // Queries
  const query = useQuery({
    queryKey: ["todos"],
    queryFn: getCelestialCoordinatesOfSun,
  });

  // Mutations
  //   const mutation = useMutation({
  //     mutationFn: postTodo,
  //     onSuccess: () => {
  //       // Invalidate and refetch
  //       queryClient.invalidateQueries({ queryKey: ["todos"] });
  //     },
  //   });

  return (
    <div>
      {/* {query.data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))} */}
      {JSON.stringify(query.data)}

      <button
        onClick={() => {
          //   mutation.mutate({
          //     id: Date.now(),
          //     title: "Do Laundry",
          //   });
        }}
      >
        Add Todo
      </button>
    </div>
  );
}
