
import React, { useState } from "react";
import { Card, CardContent } from "../components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/tabs";

const exhibits = {
  Paintings: [
    { title: "Starry Night", artist: "Vincent van Gogh" },
    { title: "Mona Lisa", artist: "Leonardo da Vinci" },
  ],
  Sculptures: [
    { title: "David", artist: "Michelangelo" },
    { title: "The Thinker", artist: "Auguste Rodin" },
  ],
  Photography: [
    { title: "Migrant Mother", artist: "Dorothea Lange" },
    { title: "Moonrise, Hernandez, New Mexico", artist: "Ansel Adams" },
  ],
};

const events = [
  { name: "Art & Wine Night", date: "March 10, 2025" },
  { name: "Sculpture Workshop", date: "March 15, 2025" },
  { name: "Photography Masterclass", date: "March 20, 2025" },
];

export default function ArtExhibits() {
  const [selectedCategory, setSelectedCategory] = useState("Paintings");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Art Exhibits</h1>
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-4">
          {Object.keys(exhibits).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(exhibits).map(([category, artworks]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artworks.map((art, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold">{art.title}</h2>
                    <p className="text-gray-600">by {art.artist}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <h2 className="text-2xl font-bold mt-6">Upcoming Events</h2>
      <div className="mt-4">
        {events.map((event, index) => (
          <Card key={index} className="mb-2">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-gray-500">{event.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}