'use client';

import Image from "next/image";
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
import { placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { loadinCityAtom } from "./atom";


type WeatherData = {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherEntry[];
  city: CityInfo;
};

type WeatherEntry = {
  dt: number;
  main: MainWeather;
  weather: WeatherDescription[];
  clouds: { all: number };
  wind: WindInfo;
  visibility: number;
  pop: number;
  sys: { pod: string };
  dt_txt: string;
};

type MainWeather = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
};

type WeatherDescription = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type WindInfo = {
  speed: number;
  deg: number;
  gust: number;
};

type CityInfo = {
  id: number;
  name: string;
  coord: Coordinates;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
};

type Coordinates = {
  lat: number;
  lon: number;
};

const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;

// Skeleton Loader Component
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

// Main Component
export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadinCityAtom);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `http://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${apiKey}&cnt=56`
        );
        return response.data;
      } catch (err) {
        throw new Error('Error fetching data');
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map((entry) => new Date(entry.dt * 1000).toISOString().split("T")[0])
    )
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isPending) return <HomeSkeleton />;

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Error fetching data</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        <section className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-1 items-end">
              <h2 className="text-2xl">
                {format(parseISO(firstData.dt_txt ?? ''), 'EEEE')}
                <span className="text-lg ml-1">
                  ({format(parseISO(firstData.dt_txt ?? ''), 'dd.MM.yyy')})
                </span>
              </h2>
            </div>

            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main.temp ?? 0)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feel Like</span>
                  <span>{convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°</span>
                </p>
                <p className="text-xs space-x-2">
                  <span>{convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}°↑</span>
                  <span>{convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}°↓</span>
                </p>
              </div>

              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d, i) => (
                  <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">{format(parseISO(d.dt_txt ?? ''), 'h.mm a')}</p>
                    <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                    <p>{convertKelvinToCelsius(d?.main.temp ?? 0)}°</p>
                  </div>
                ))}
              </div>
            </Container>
          </div>

          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">{firstData.weather[0].description}</p>
              <WeatherIcon iconName={getDayOrNightIcon(firstData.weather[0].icon, firstData.dt_txt)} />
            </Container>

            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto flex flex-wrap">
              <WeatherDetails 
                visibility={metersToKilometers(firstData?.visibility ?? 10000)} 
                airPressure={`${firstData?.main.pressure} hPa`}
                humidity={`${firstData?.main.humidity} % `}
                sunrise={format(fromUnixTime(data.city.sunrise ?? 1702989452), "H:mm")}
                sunset={format(fromUnixTime(data.city.sunset ?? 1702989452), "H:mm")}
                WindSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
              />
            </Container>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 Day)</p>
          {firstDataForEachDate.map((d, i) => {
            return (
              <ForecastWeatherDetail
                key={i}
                description={d?.weather[0].description ?? ""}
                weatherIcon={d?.weather[0].icon ?? "01d"}
                date={format(parseISO(d?.dt_txt ?? ""), "dd,MM")}
                day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                feels_like={d?.main.feels_like ?? 0}
                temp={d?.main.temp ?? 0}
                temp_max={d?.main.temp_max ?? 0}
                temp_min={d?.main.temp_min ?? 0}
                visibility={metersToKilometers(firstData?.visibility ?? 10000)} 
                airPressure={`${d?.main.pressure} hPa`}
                humidity={`${d?.main.humidity} % `}
                sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702989452), "H:mm")}
                sunset={format(fromUnixTime(data?.city.sunset ?? 1702989452), "H:mm")}
                WindSpeed={convertWindSpeed(d?.wind.speed ?? 1.64)}
              />
            );
          })}
        </section>
      </main>
    </div>
  );
}