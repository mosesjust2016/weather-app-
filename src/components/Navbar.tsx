"use client";

import React, { useState } from 'react';
import { MdWbSunny, MdOutlineLocationOn } from "react-icons/md";
import SearchBox from './SearchBox';
import axios from 'axios';
import { useAtom } from 'jotai';
import { loadinCityAtom, placeAtom } from '@/app/atom';

type Props = { location?: string };

interface City {
  name: string;
  // Add other properties if needed
}

const Navbar = ({ location }: Props) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setPlace] = useAtom(placeAtom);
  const [, setLoadingCity] = useAtom(loadinCityAtom);

  function handleSuggestionOnClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();

    if (suggestions.length === 0) {
      setError("Location Not Found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get<{ list: City[] }>(
          `http://api.openweathermap.org/data/2.5/find?q=${value}&appid=${apiKey}`
        );
        const suggestions = response.data.list.map((item) => item.name);
        setSuggestions(suggestions);
        setError('');
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  return (
    <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
      <div className="h-[80px] w-full flex items-center justify-between max-w-7xl px-3 mx-auto">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-gray-500 text-3xl">Weather</h2>
          <MdWbSunny className="text-3xl mt-1 text-yellow-300" />
        </div>
        <section className="flex gap-2 items-center">
          <MdOutlineLocationOn className="text-3xl" />
          <p className="text-slate-900/80 text-sm">{location}</p>
          <div className="relative">
            <SearchBox
              value={city}
              onSubmit={handleSubmitSearch}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <SuggestionsBox
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              handleSuggestionOnClick={handleSuggestionOnClick}
              error={error}
            />
          </div>
        </section>
      </div>
    </nav>
  );
};

export default Navbar;

function SuggestionsBox({
  showSuggestions,
  suggestions,
  handleSuggestionOnClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionOnClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2 absolute">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1">{error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionOnClick(item)}
              className="cursor-pointer p-1 rounded hover:bg-gray-200"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}