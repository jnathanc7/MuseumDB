import React from "react";
import { Card, CardContent } from "../components/card";
import { Lightbox } from "react-modal-image";
import { useState } from "react";

const images = [
  {
    src: "/Mother.jpeg",
    alt: "Mother",
    artist: "Kathryn Cook(American, born 1979)",
  },
];

export default function PhotographsGallery() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6">Photographs Art Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card
            key={index}
            className="cursor-pointer overflow-hidden"
            onClick={() => setOpen(image.src)}
          >
            <CardContent className="p-2">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <p className="mt-2 text-center text-gray-700 font-semibold">
              <div>{image.alt}</div>
              <div>{image.artist}</div>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {open && <Lightbox large={open} onClose={() => setOpen(null)} />}
    </div>
  );
}