import { Elysia } from "elysia";
import DiContainer from "../di/di-container";
import { TDbContext } from "../db/drizzle";
import {
  areas,
  cities,
  employees,
  priorityDegrees,
  ratings,
} from "../db/schema";
import { TEmployeeEntity } from "../types/employee.type";

export const SeedController = new Elysia({
  name: "Seed.Controller",
  tags: ["Seed"],
})
  .resolve(() => ({
    db: DiContainer.get<TDbContext>("db"),
  }))
  .group("/seed", (app) =>
    app.get("initial", async ({ db }) => {
      // seed root users

      db.transaction(async (tx) => {
        const usersSeeding = ["manager", "supervisor", "scout"].map(
          async (role, idx) => {
            const hashedPassword = await Bun.password.hash(role.repeat(2));
            return await tx.insert(employees).values({
              name: role,
              password: hashedPassword,
              phone: idx.toString().repeat(10),
              role: role as TEmployeeEntity["role"],
            });
          },
        );

        await Promise.all(usersSeeding);

        // seed cities

        const [{ id: cityId }] = await tx
          .insert(cities)
          .values({
            name: "حلب",
          })
          .returning({ id: cities.id });

        // seed areas

        await tx.insert(areas).values([
          {
            name: "زبدية",
            cityId,
          },
          {
            name: "بستان القصر",
            cityId,
          },
        ]);
        // seed priority degrees

        await tx.insert(priorityDegrees).values([
          {
            name: "عادي",
            color: "grey",
          },
          {
            name: "مستعجل",
            color: "orange",
          },
          {
            name: "مستعجل جدا",
            color: "red",
          },
        ]);

        // seed ratings

        await tx.insert(ratings).values([
          {
            name: "تقيم A",
            code: "A",
            description: "وصف االتقييم A",
          },
          {
            name: "تقيم B",
            code: "B",
            description: "وصف االتقييم B",
          },
          {
            name: "تقيم C",
            code: "C",
            description: "وصف االتقييم C",
          },
        ]);
      });
    }),
  );
