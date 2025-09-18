import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/movieCard";

const BASE_API_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${BASE_API_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${BASE_API_URL}/discover/movie?sort_by=popularity.desc`;
      const res = await fetch(endpoint, API_OPTIONS);

      if (!res.ok) throw new Error("Failed to fetch movies");

      const data = await res.json();

      console.log(data);

      if (!data.results) {
        setErrorMessage(data.status_message || "Failed to fetch movies.");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
    } catch (err) {
      console.error(`Error fetching movies: ${err}`);
      setErrorMessage("Error fetching movies, Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
    - Use Effect
      two arguments 
        1- code function will run when change happen according to:
        2- the dependencies list it determine when this function will run if empty means do the code immediately 
  */
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="../public/hero-img.png" alt="" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <h1 className="text-white">{searchTerm}</h1>
        </header>

        <section className="all-movies ">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
