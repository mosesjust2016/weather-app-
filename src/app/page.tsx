'use client';

import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { fromUnixTime, parseISO } from "date-fns";
import format from "date-fns/format";
import Container from "@/components/Container";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import WeatherIcon from "./WeatherIcon";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import WeatherDetails from "@/components/WeatherDetails";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { placeAtom, loadingCityAtom } from "./atom"; // Updated to loadingCityAtom
import { useAtom } from "jotai";
import { useEffect } from "react";

// Define the WeatherEntry type based on OpenWeather API response
interface WeatherEntry {
  dt: number;
  dt_txt: string;
  weather: { icon: string; description: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number };
}

interface WeatherData {
  list: WeatherEntry[];
  city: {
    name: string;
    sunrise: number;
    sunset: number;
  };
}

const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;

// Helper to validate and format dates safely
const safeFormat = (
  dateValue: string | number | undefined,
  dateFormat: string,
  fallback: string = "N/A"
): string => {
  try {
    if (!dateValue && dateValue !== 0) return fallback;

    if (typeof dateValue === "number") {
      return format(fromUnixTime(dateValue), dateFormat);
    }
    if (typeof dateValue === "string") {
      return format(parseISO(dateValue), dateFormat);
    }

    return fallback;
  } catch (e: unknown) {
    console.error("Date formatting error:", (e as Error).message, { dateValue });
    return fallback;
  }
};

// Helper to ensure a valid icon string
const getSafeIcon = (icon: string | undefined): string => icon ?? "01d";

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location="" />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        <section className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-1 items-end">
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4 space-y-2">
                <div className="h-12 w-16 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-10 overflow-x-auto w-full justify-between pr-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 items-center">
                    <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit flex-col px-4 items-center">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse"></div>
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 flex flex-wrap">
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </Container>
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
          {[...Array(7)].map((_, i) => (
            <Container key={i} className="px-4 py-2 flex gap-4">
              <div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </Container>
          ))}
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  const [place] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom); // Updated from loadinCityAtom

  const { isPending, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ["repoData", place],
    queryFn: async () => {
      try {
        const response = await axios.get<WeatherData>(
          `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${apiKey}&cnt=56`
        );
        return response.data;
      } catch (err) {
        throw new Error("Error fetching data");
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list?.[0];

  const uniqueDates = [
    ...new Set(
      data?.list?.map((entry: WeatherEntry) =>
        new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date: string) =>
    data?.list?.find((entry: WeatherEntry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    })
  );

  if (isPending || loadingCity) return <HomeSkeleton />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error fetching data: {error.message}</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city?.name ?? "Unknown"} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        <section className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-1 items-end">
              <h2 className="text-2xl">
                {safeFormat(firstData?.dt_txt, "EEEE")}
                <span className="text-lg ml-1">
                  ({safeFormat(firstData?.dt_txt, "dd.MM.yyyy")})
                </span>
              </h2>
            </div>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main?.temp ?? 0)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feel Like</span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.feels_like ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.temp_min ?? 0)}°↑
                  </span>
                  <span>
                    {convertKelvinToCelsius(firstData?.main?.temp_max ?? 0)}°↓
                  </span>
                </p>
              </div>
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list?.map((d: WeatherEntry, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                  >
                    <p className="whitespace-nowrap">
                      {safeFormat(d.dt_txt, "h:mm a")}
                    </p>
                    <WeatherIcon
                      iconName={getDayOrNightIcon(getSafeIcon(d.weather?.[0]?.icon), d.dt_txt)}
                    />
                    <p>{convertKelvinToCelsius(d?.main?.temp ?? 0)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {firstData?.weather?.[0]?.description ?? "N/A"}
              </p>
              <WeatherIcon
                iconName={getDayOrNightIcon(
                  getSafeIcon(firstData?.weather?.[0]?.icon),
                  firstData?.dt_txt
                )}
              />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto flex flex-wrap">
              <WeatherDetails
                visibility={metersToKilometers(firstData?.visibility ?? 10000)}
                airPressure={`${firstData?.main?.pressure ?? 0} hPa`}
                humidity={`${firstData?.main?.humidity ?? 0} %`}
                sunrise={safeFormat(data?.city?.sunrise, "H:mm")}
                sunset={safeFormat(data?.city?.sunset, "H:mm")}
                WindSpeed={convertWindSpeed(firstData?.wind?.speed ?? 1.64)}
              />
            </Container>
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 Day)</p>
          {firstDataForEachDate.map((d: WeatherEntry | undefined, i: number) => (
            <ForecastWeatherDetail
              key={i}
              description={d?.weather?.[0]?.description ?? ""}
              weatherIcon={getSafeIcon(d?.weather?.[0]?.icon)}
              date={safeFormat(d?.dt_txt, "dd.MM")}
              day={safeFormat(d?.dt_txt, "EEEE")}
              feels_like={d?.main?.feels_like ?? 0}
              temp={d?.main?.temp ?? 0}
              temp_max={d?.main?.temp_max ?? 0}
              temp_min={d?.main?.temp_min ?? 0}
              visibility={metersToKilometers(firstData?.visibility ?? 10000)}
              airPressure={`${d?.main?.pressure ?? 0} hPa`}
              humidity={`${d?.main?.humidity ?? 0} %`}
              sunrise={safeFormat(data?.city?.sunrise, "H:mm")}
              sunset={safeFormat(data?.city?.sunset, "H:mm")}
              WindSpeed={convertWindSpeed(d?.wind?.speed ?? 1.64)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}