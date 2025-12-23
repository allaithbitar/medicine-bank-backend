import { Elysia, t } from "elysia";
import DiContainer from "../di/di-container";
import { TDbContext } from "../db/drizzle";
import {
  areas,
  areasToEmployees,
  cities,
  disclosures,
  employees,
  patients,
  patientsPhoneNumbers,
  priorityDegrees,
  ratings,
} from "../db/schema";
import { TAddEmployeeDto, TEmployeeEntity } from "../types/employee.type";
import { employeeInsertModel } from "../models/employee.model";
import { faker } from "@faker-js/faker";
import { getRandomArrayItem } from "../db/helpers";
import { TAddPatientDto, TPatient } from "../types/patient.type";
import {
  TAddDisclosureDto,
  TDisclosure,
} from "../types/disclosure.type";
import { eq, InferInsertModel } from "drizzle-orm";
import oldDbDisclosures from "../old_db_disclosures.json";
import oldDbEmployees from "../old_db_employees.json";
import oldDbAreas from "../old_db_areas.json";
import { rowsToExcel } from "../libs/xlsx";

export const SeedController = new Elysia({
  name: "Seed.Controller",
  tags: ["Seed"],
})
  .resolve(() => ({
    db: DiContainer.get<TDbContext>("db"),
  }))
  .group("/seed", (app) =>
    app
      .get("initial", async ({ db }) => {
        const disclosuresArr = await db.select().from(disclosures).limit(10);
        rowsToExcel(disclosuresArr);
        // seed root users
        /*         db.transaction(async (tx) => {
          const usersSeeding = ["manager", "supervisor", "scout"].map(
            async (role, idx) => {
              const hashedPassword = await Bun.password.hash(role.repeat(2));
              return tx.insert(employees).values({
                name: role,
                password: hashedPassword,
                phone: idx.toString().repeat(10),
                role: role as TEmployeeEntity["role"],
              });
            },
          );

          await Promise.all(usersSeeding);

          // seed cities

          // const [{ id: cityId }] = await tx
          //   .insert(cities)
          //   .values({
          //     name: "حلب",
          //   })
          //   .returning({ id: cities.id });

          // seed areas

          // await tx.insert(areas).values([
          //   {
          //     name: "زبدية",
          //     cityId,
          //   },
          //   {
          //     name: "بستان القصر",
          //     cityId,
          //   },
          // ]);
          // seed priority degrees

          // await tx.insert(priorityDegrees).values([
          //   {
          //     name: "عادي",
          //     color: "grey",
          //   },
          //   {
          //     name: "مستعجل",
          //     color: "orange",
          //   },
          //   {
          //     name: "مستعجل جدا",
          //     color: "red",
          //   },
          // ]);

          // seed ratings
          //
          // await tx.insert(ratings).values([
          //   {
          //     name: "تقيم A",
          //     code: "A",
          //     description: "وصف االتقييم A",
          //   },
          //   {
          //     name: "تقيم B",
          //     code: "B",
          //     description: "وصف االتقييم B",
          //   },
          //   {
          //     name: "تقيم C",
          //     code: "C",
          //     description: "وصف االتقييم C",
          //   },
          // ]);
        }); */
      })
      .post(
        "employees",
        async ({ db, body }) => {
          const areas = await db.query.areas.findMany();
          const roles = body.roles.length
            ? body.roles
            : (["manager", "supervisor", "scout"] as TEmployeeEntity["role"][]);
          await db.insert(employees).values(
            Array.from({ length: body.count }).map((_, idx) => ({
              name: faker.person.fullName(),
              password: "7515",
              phone: faker.phone
                .number({ style: "international" })
                .slice(0, 10),
              role: getRandomArrayItem(roles),
              areaId: idx / 2 === 0 ? null : getRandomArrayItem(areas).id,
            })),
          );
        },
        {
          body: t.Object({
            count: t.Number(),
            roles: t.Array(employeeInsertModel.properties.role),
          }),
        },
      )
      .post(
        "beneficiaries",
        async ({ db, body }) => {
          const areas = await db.query.areas.findMany();

          const result = Array.from({ length: body.count }).map((_, idx) => {
            return db.transaction(async (_tx) => {
              const [{ id }] = await _tx
                .insert(patients)
                .values({
                  name: faker.person.fullName(),
                  areaId: idx / 2 === 0 ? null : getRandomArrayItem(areas).id,
                  address: faker.location.streetAddress({
                    useFullAddress: true,
                  }),
                  about: faker.person.bio(),
                  nationalNumber: Date.now().toString().slice(0, 12),
                })
                .returning({ id: patients.id });

              await _tx.insert(patientsPhoneNumbers).values({
                patientId: id,
                phone: faker.phone.number({ style: "national" }).slice(0, 11),
              });
            });
          });
          await Promise.all(result);
        },
        {
          body: t.Object({
            count: t.Number(),
          }),
        },
      )
      .post(
        "disclosures",
        async ({ db, body }) => {
          const employeeIds = (
            await db
              .select({ id: employees.id })
              .from(employees)
              .where(eq(employees.role, "scout"))
          ).map((e) => e.id);

          const beneficiaryIds = (
            await db.select({ id: patients.id }).from(patients)
          ).map((e) => e.id);

          const priorityIds = (
            await db.select({ id: priorityDegrees.id }).from(priorityDegrees)
          ).map((pd) => pd.id);

          const statuses = [
            "active",
            "canceled",
            "finished",
          ] as TDisclosure["status"][];

          await db.insert(disclosures).values(
            Array.from({ length: body.count }).map((_, idx) => ({
              employeeId:
                idx / 2 === 0 ? getRandomArrayItem(employeeIds) : null,
              patientId: getRandomArrayItem(beneficiaryIds),
              priorityId: getRandomArrayItem(priorityIds),
              status: getRandomArrayItem(statuses),
            })),
          );
        },
        {
          body: t.Object({
            count: t.Number(),
          }),
        },
      )

      .get("syncOldData", async ({ db }) => {
        const allEmployees = await db.query.employees.findMany();
        const allAreas = await db.query.areas.findMany();
        const allRatings = await db.query.ratings.findMany();
        const allPriorityDegrees = await db.query.priorityDegrees.findMany();

        // RATINGS
        const oldDataVisitStatues = {
          NOT_DONE: "لم يتم الكشف",
          NOT_FINISHED: "حجة",
          NOT_FINISHED_PLUS: "+حجة",
          FINISHED: "تم",
        };

        const allDataResultTypes = {
          A: "A",
          B: "B",
          C: "C",
          X: "X",
          FINISHED: "تم",
        };

        // patients
        //

        await db.delete(disclosures);
        await db.delete(patientsPhoneNumbers);
        await db.delete(patients);
        // return;
        const paitentsToAdd: Record<
          string,
          InferInsertModel<typeof patients> &
            Pick<TAddPatientDto, "phoneNumbers"> & {
              disclosures: {
                logs: {
                  id: string;
                  date: string;
                  details: string;
                  note: string;
                  result: {
                    id: string;
                    name: string;
                    type: string;
                  };
                }[];
                note: string;
                createdAt: string;
                scoutName: string;
                priorityDegreeName: string;
              }[];
            }
        > = {};
        for (const d of oldDbDisclosures) {
          if (d.phone.trim() in paitentsToAdd) {
            paitentsToAdd[d.phone.trim()] = {
              ...paitentsToAdd[d.phone.trim()],
              name: paitentsToAdd[d.phone.trim()].name + ` (#) ${d.name}`,
              address:
                paitentsToAdd[d.phone.trim()].address +
                ` (#) ${d.address_details}`,

              disclosures: [
                ...paitentsToAdd[d.phone.trim()].disclosures,
                {
                  logs: d.logs,
                  createdAt: d.created_at,
                  note: d.details,
                  scoutName: d.user.name.trim(),
                  priorityDegreeName: d.priority.color,
                },
              ],
            };
          } else {
            paitentsToAdd[d.phone.trim()] = {
              name: d.name,
              createdAt: new Date(d.created_at).toISOString(),
              phoneNumbers: [
                ...(d.optionalPhone.trim() ? [d.optionalPhone.trim()] : []),
                d.phone.trim(),
              ],
              address: d.address_details,
              updatedAt: d.updated_at
                ? new Date(d.updated_at).toISOString()
                : null,
              areaId:
                allAreas.find((a) => a.name === d.region.name.trim())?.id ?? "",
              disclosures: [
                {
                  logs: d.logs,
                  createdAt: d.created_at,
                  note: d.details,
                  scoutName: d.user.name.trim(),
                  priorityDegreeName: d.priority.color,
                },
              ],
            };
          }
        }

        const paitentsWithDisclosuresMapped = Object.values(paitentsToAdd).map(
          (p) => {
            const disclosureToAdd: {
              disclosure: InferInsertModel<typeof disclosures>;
            }[] = [];

            p.disclosures.forEach(
              ({ logs, createdAt, note, scoutName, priorityDegreeName }) => {
                const disclosure: InferInsertModel<typeof disclosures> =
                  {} as any;

                logs.forEach((disclosureLog) => {
                  disclosure.createdAt = createdAt;
                  disclosure.initialNote = note;
                  disclosure.status = "active";
                  disclosure.scoutId =
                    allEmployees.find((e) => e.name === scoutName)?.id ?? null;

                  disclosure.priorityId =
                    allPriorityDegrees.find(
                      (d) => d.name === priorityDegreeName,
                    )?.id ?? "";

                  disclosure.patientId = "";

                  switch (disclosureLog.result.name) {
                    case oldDataVisitStatues.NOT_DONE:
                      disclosure.visitResult = "not_completed";
                      break;
                    case oldDataVisitStatues.NOT_FINISHED:
                    case oldDataVisitStatues.NOT_FINISHED_PLUS: {
                      disclosure.visitResult = "cant_be_completed";
                      disclosure.visitReason = disclosureLog.details;
                      disclosure.visitNote = disclosureLog.note;
                      break;
                    }
                    case oldDataVisitStatues.FINISHED: {
                      disclosure.visitResult = "completed";
                      disclosure.visitReason = disclosureLog.details;
                      disclosure.visitNote = disclosureLog.note;

                      // Set rating directly on disclosure
                      const isCustomRating = disclosureLog.result.type === allDataResultTypes.FINISHED;
                      const customRating = isCustomRating ? disclosureLog.note : null;
                      const ratingNote = [
                        allDataResultTypes.A,
                        allDataResultTypes.B,
                        allDataResultTypes.C,
                        allDataResultTypes.X,
                      ].includes(disclosureLog.result.type)
                        ? disclosureLog.note
                        : null;
                      const ratingId = allRatings.find(
                        (r) => r.code === disclosureLog.result.type,
                      )?.id ?? null;

                      disclosure.isCustomRating = isCustomRating;
                      disclosure.customRating = customRating;
                      disclosure.ratingNote = ratingNote;
                      disclosure.ratingId = ratingId;
                      break;
                    }
                  }
                });

                disclosureToAdd.push({
                  disclosure,
                });
              },
            );
            return { ...p, disclosures: disclosureToAdd };
          },
        );

        // return paitentsWithDisclosuresMapped;
        // return
        await Promise.all(
          paitentsWithDisclosuresMapped.map(async (p) => {
            const {
              phoneNumbers,
              disclosures: patientDisclosures,
              ...rest
            } = p;
            await db.transaction(async (tx) => {
              const [{ id: patientId }] = await tx
                .insert(patients)
                .values({
                  ...rest,
                  name: rest.name.includes("(#)")
                    ? rest.name
                        .split("(#)")
                        .map((n, idx) => `(${idx + 1})_` + n)
                        .join(" ") + " ( مكرر يرجى الإطلاع )"
                    : rest.name,
                  address: rest.address?.includes("(#)")
                    ? rest.address
                        .split("(#)")
                        .map((n, idx) => `(${idx + 1})_` + n)
                        .join(" ")
                    : rest.address,
                })
                .returning({ id: patients.id });

              if (phoneNumbers?.length) {
                await tx.insert(patientsPhoneNumbers).values(
                  phoneNumbers.map((phone) => ({
                    patientId,
                    phone,
                  })),
                );
              }
              //
              if (patientDisclosures.length) {
                await Promise.all(
                  patientDisclosures.map(async (d) => {
                    await tx
                      .insert(disclosures)
                      .values({ ...d.disclosure, patientId })
                      .returning({ id: disclosures.id });
                  }),
                );
              }
            });
          }),
        );

        return {
          // Data migration completed successfully
        };
      })
      .get("syncOldAreas", async ({ db }) => {
        const city = await db.query.cities.findFirst();
        const areasSet = new Set<string>();
        for (const a of oldDbAreas) {
          areasSet.add(a.name.trim());
        }

        if (city) {
          await db.insert(areas).values(
            Array.from(areasSet.values()).map((name) => ({
              cityId: city.id,
              name,
            })),
          );
        }
      })
      .get("syncPriorityDegrees", async ({ db }) => {
        const DEGS = {
          NORAML: "عادي",
          ATTENTION: "انتباه",
          MANDATORY: "ضروري",
          URGENT: "مستعجل",
        };
        // const degs = {};
        await db
          .insert(priorityDegrees)
          .values(Object.values(DEGS).map((v) => ({ name: v })));
        // return degs;
        // const city = await db.query.cities.findFirst();
        // const areasSet = new Set<string>();
        // for (const a of oldDbAreas) {
        //   areasSet.add(a.name.trim());
        // }
        //
        // if (city) {
        //   await db.insert(areas).values(
        //     Array.from(areasSet.values()).map((name) => ({
        //       cityId: city.id,
        //       name,
        //     })),
        //   );
        // }
      })

      .get("syncOldRatings", async ({ db }) => {
        await db.delete(ratings);
        const resultTypes = {
          A: "A",
          B: "B",
          C: "C",
          X: "X",
          FINISHED: "تم",
        };
        await db.insert(ratings).values([
          {
            code: resultTypes.A,
            name: `تقييم ${resultTypes.A}`,
            description: "",
          },
          {
            code: resultTypes.B,
            name: `تقييم ${resultTypes.B}`,
            description: "",
          },

          {
            code: resultTypes.C,
            name: `تقييم ${resultTypes.C}`,
            description: "",
          },

          {
            code: resultTypes.X,
            name: `تقييم ${resultTypes.X}`,
            description: "",
          },
        ]);
      })

      .get("syncOldEmployees", async ({ db }) => {
        const appAreas = await db.query.areas.findMany();
        console.log({ appAreas });

        const employeesToAdd: TAddEmployeeDto[] = [];

        for (const e of oldDbEmployees) {
          employeesToAdd.push({
            name: e.name.trim(),
            password: Bun.password.hashSync(e.phone),
            phone: e.phone.trim(),
            role:
              e.permission_id === "1"
                ? "manager"
                : e.permission_id === "2"
                  ? "supervisor"
                  : "scout",
            areaIds: e.regions
              .map(
                (r: any) =>
                  appAreas.find((aa) => aa.name === r.name.trim())?.id,
              )
              .filter(Boolean),
          });

          employeesToAdd.map(async (e) => {
            const { areaIds, ...rest } = e;
            await db.transaction(async (tx) => {
              const [{ id }] = await tx
                .insert(employees)
                .values(rest)
                .returning({ id: employees.id });
              if (areaIds?.length) {
                await tx.insert(areasToEmployees).values(
                  areaIds.map((aid) => ({
                    areaId: aid,
                    employeeId: id,
                  })),
                );
              }
            });
          });
        }
      }),
  );
