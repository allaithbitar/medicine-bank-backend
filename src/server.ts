import { Elysia, ValidationError } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from "./constants/errors";
import { ERROR_MESSAGES } from "./constants/error-messages";

function customProps(ctx: ElysiaLoggerContext) {
  return {
    ip: ctx.server?.requestIP,
    body: ctx?.body,
    params: ctx.params,
    query: ctx.query,
  };
}

import { logger, fileLogger } from "@bogeychan/elysia-logger";
import {
  getReadableDbErrorMessage,
  isDbError,
  transformDbError,
} from "./db/helpers";
import { staticPlugin } from "@elysiajs/static";

import { ElysiaLoggerContext } from "@bogeychan/elysia-logger/dist/types";
import cors from "@elysiajs/cors";
import { EmployeesController } from "./controllers/employees.controller";
import { PatientsController } from "./controllers/patients.controller";
import { TSystemError } from "./types/common.types";
import { DisclosuresController } from "./controllers/disclosures.controller";
import { AuthController } from "./controllers/auth.controller";
import { CitiesController } from "./controllers/cities.controller";
import { AreasController } from "./controllers/areas.controller";
import { PriorityDegreesController } from "./controllers/priority-degrees.controller";
import { RatingsController } from "./controllers/ratings.controller";
import { OfflineController } from "./controllers/offline.controller";
import { SeedController } from "./controllers/seed.controller";
import { SatisticsController } from "./controllers/satistics.controller";
import { FamilyMembersController } from "./controllers/family-members.controller";
import { MedicinesController } from "./controllers/medicine.controller";

import { SystemBroadcastsController } from "./controllers/system-broadcasts.controller";
import { MeetingsController } from "./controllers/meetings.controller";
import { NotificationsController } from "./controllers/notifications.controller";

const app = new Elysia({
  serve: {
    idleTimeout: 60,
  },
})
  .use(cors())
  .use(
    logger({
      customProps,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    }),
  )
  .use(
    fileLogger({
      file: "./logs.log",
      customProps,
      enabled: Bun.env.NODE_ENV === "production",
    }),
  )
  .use(
    swagger({
      documentation: {
        tags: [{ name: "Auth" }, { name: "Products" }, { name: "Images" }],
      },
    }),
  )
  .use(staticPlugin())
  .onError(({ error, set }) => {
    let message = { en: "", ar: "", details: "", code: "" } as TSystemError;

    switch (true) {
      case error instanceof UnauthorizedError:
      case error instanceof NotFoundError:
      case error instanceof ServerError:
      case error instanceof BadRequestError: {
        set.status = error.code;
        message = {
          ...message,
          ...ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES],
        };
        break;
      }
      case error instanceof ValidationError: {
        return JSON.parse(error.message);
      }
      case isDbError(error): {
        const _error = transformDbError(error);
        message = getReadableDbErrorMessage(_error);
        break;
      }

      default: {
        if (error) {
          message = {
            en: (error as any).message,
            ar: (error as any).message,
            details: JSON.stringify(error),
            code: "Unknown",
          };
        }
      }
    }

    return { success: false, data: null, errorMessage: message };
  })
  .onAfterHandle(({ response }) => {
    const responseContentType =
      ((response as Response)?.headers as Headers)?.get("content-type") ?? "";

    if (
      responseContentType?.includes("audio") ||
      responseContentType?.includes("video")
    ) {
      ((response as Response)?.headers as Headers).set(
        "Cross-Origin-Resource-Policy",
        "cross-origin",
      );
      ((response as Response)?.headers as Headers).set(
        "Accept-Ranges",
        "bytes",
      );

      return response;
    }
    return {
      success: true,
      data: response ?? null,
      errorMessage: null,
    };
  })
  .use(AuthController)
  .use(EmployeesController)
  .use(PatientsController)
  .use(DisclosuresController)
  .use(CitiesController)
  .use(AreasController)
  .use(PriorityDegreesController)
  .use(RatingsController)
  .use(OfflineController)
  .use(SatisticsController)
  .use(FamilyMembersController)
  .use(MedicinesController)

  .use(SystemBroadcastsController)
  .use(MeetingsController)
  .use(NotificationsController)
  .use(SeedController)
  .get("/", async () => {
    return "pong";
  });

export default app;
