import React from "react";
import { Card, CardContent } from "../components/card";
import { Lightbox } from "react-modal-image";
import { useState } from "react";

const images = [
  {
    src: "/Blue_Vessel.jpeg",
    alt: "Blue Vessel Ceramic Art",
    artist: "Hiruma Kazuyo (Japanese, born 1947)",
  },
  {
    src: "/Sainami_Koki (Wave_Incense_Holder).jpeg",
    alt: "Sainami Koki (Wave Incense Holder)",
    artist: "Miyashita Zenji (Japanese, 1939–2012)",
  },
];

export default function CeramicGallery() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6">Ceramic Art Gallery</h1>
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
                {image.artist}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {open && <Lightbox large={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
