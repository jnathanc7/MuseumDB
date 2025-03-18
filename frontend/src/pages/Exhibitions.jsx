import React from "react";
import { Link } from "react-router-dom";


export default function Exhibits() {
  return (
    <div className="Exhibitions-wrapper">

      <div className = "Exhibitions-hero" style = {{backgroundImage: `url(${"/ExhibitionsHero.jpg"})`}}>
        <h1>Welcome to the Art Exhibition</h1>
        <p>
          Explore the beauty of ceramic art by renowned artists.
        </p>
      </div>

      <div className="Exhibitions-Categories">
        <div><Link
          to="/ceramic"
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Ceramic Gallery
        </Link></div>
        <div><Link
          to="/paintings"
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Painting Gallery
        </Link></div>
        <div><Link
          to="/sculptures"
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Sculpture Gallery
        </Link></div>
        <div><Link
          to="/prints"
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Prints Gallery
        </Link></div>
        <div><Link
          to="/photographs"
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Photographs Gallery
        </Link></div>
        </div>
    </div>
  );
}