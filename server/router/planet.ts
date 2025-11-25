import * as z from "zod";
import { os } from "@orpc/server";

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = os.output(PlanetSchema).handler(() => {
  return { id: 1, name: "Smith", description: "description" };
});

export default {
  list: listPlanet,
};
