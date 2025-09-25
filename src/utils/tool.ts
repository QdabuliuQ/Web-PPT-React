import { PlacementMapped } from "@/element/Text/constant";

export function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function placementConvey(placement: keyof typeof PlacementMapped) {
  const mapped = PlacementMapped[placement as keyof typeof PlacementMapped];
  const [align, justify] = mapped.split(" ");
  return {
    display: "flex",
    alignItems: align,
    justifyContent: justify,
  };
}
