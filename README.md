# Weather App

A modern, responsive weather forecasting application built with Next.js. This app provides real-time weather data and a 7-day forecast using the OpenWeatherMap API. It features a sleek, user-friendly interface styled with Tailwind CSS, enhanced with dynamic class handling via clsx.

## Key Features:

- **Current Weather:** Displays temperature, feels-like temperature, min/max temperatures, and detailed weather conditions for the selected location.
- **Hourly Forecast:** Shows hourly weather updates with icons and temperatures.
- **7-Day Forecast:** Provides a daily weather overview with detailed metrics like humidity, wind speed, and visibility.
- **Location Search:** Includes an autocomplete search bar powered by OpenWeatherMap's API for easy city selection.
- **Skeleton Loading:** Implements a smooth loading experience with animated placeholders during data fetching.

## Tech Stack:

- **Next.js**: For server-side rendering and a robust React framework.
- **Jotai**: Lightweight state management for handling location and loading states.
- **date-fns**: For efficient date formatting and manipulation.
- **Axios**: For making HTTP requests to the OpenWeatherMap API.
- **React Query**: For seamless data fetching, caching, and synchronization.
- **clsx**: For conditional class name management.
- **Tailwind CSS**: For rapid, responsive styling with a utility-first approach.
- **OpenWeatherMap API**: Provides accurate, real-time weather data.

## Getting Started:

1. Clone the repository:
   ```sh
   git clone <repo-url>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up your OpenWeatherMap API key in `.env.local`:
   ```sh
   NEXT_PUBLIC_WEATHER_KEY=<your_api_key>
   ```

4. Run the development server:
   ```sh
   npm run dev
   ```

Explore weather conditions with ease and style! Contributions are welcome—feel free to submit issues or pull requests.
