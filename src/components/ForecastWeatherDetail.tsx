import React from 'react';
import Container from './Container';
import WeatherIcon from '@/app/WeatherIcon';
import WeatherDetails, { WeatherDetailProps } from './WeatherDetails';
import { convertKelvinToCelsius } from '@/utils/convertKelvinToCelsius';

export interface ForecastWeatherDetailProps extends WeatherDetailProps {
  weatherIcon: string;
  date: string;
  day: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
}

const ForecastWeatherDetail = (props: ForecastWeatherDetailProps) => {
  const {
    weatherIcon = "02d",
    date = "19.09",
    day = "Tuesday",
    temp,
    feels_like,
    temp_min,
    temp_max,
    description,
    ...weatherDetailsProps // Spread the rest for WeatherDetails
  } = props;

  return (
    <Container className="gap-4">
      {/* Left */}
      <section className="flex gap-4 items-center px-4">
        <div className="flex flex-col gap-4 items-center">
          <WeatherIcon iconName={weatherIcon} />
          <p>{date}</p>
          <p className="text-sm">{day}</p>
        </div>

        {/* Weather Info */}
        <div className="flex flex-col px-4">
          <span className="text-5xl">{convertKelvinToCelsius(temp ?? 0)}°</span>
          <p className="text-xs space-x-1 whitespace-nowrap">
            <span>Feels Like</span>
            <span>{convertKelvinToCelsius(feels_like ?? 0)}°</span>
          </p>
          <p className="text-xs space-x-2">
            <span>{convertKelvinToCelsius(temp_min ?? 0)}°↓</span>
            <span>{convertKelvinToCelsius(temp_max ?? 0)}°↑</span>
          </p>
          <p className="capitalize">{description}</p>
        </div>
      </section>

      {/* Right */}
      <section className="overflow-x-auto flex justify-between gap-4 px-4 w-full pr-10">
        <WeatherDetails {...weatherDetailsProps} />
      </section>
    </Container>
  );
};

export default ForecastWeatherDetail;