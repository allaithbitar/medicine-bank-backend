import { Elysia, ValidationError } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from "./constants/errors";
import { ERROR_MESSAGES } from "./constants/error-messages";
import { createStream } from "rotating-file-stream";
import { pino } from "pino";

const errorLogStream = createStream("error.logs", {
  interval: "1d", // Rotate daily
  maxFiles: 7, // Keep 7 days of logs
  path: "./logs",
  compress: "gzip",
});

const requestLogStream = createStream("requests.logs", {
  interval: "1d", // Rotate daily
  maxFiles: 7, // Keep 7 days of logs
  path: "./logs",
  compress: "gzip",
});

const errorLogger = pino(
  {
    level: "error",
  },
  errorLogStream,
);

const requestLogger = pino(
  {
    level: "info",
  },
  requestLogStream,
);

function customProps(ctx: ElysiaLoggerContext) {
  return {
    ip: ctx.server?.requestIP,
    body: ctx?.body,
    params: ctx.params,
    query: ctx.query,
  };
}

import { logger } from "@bogeychan/elysia-logger";
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
import { AutocompleteController } from "./controllers/autocomplete.controller";
import { PaymentsController } from "./controllers/payments.controller";

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
    swagger({
      documentation: {
        tags: [{ name: "Auth" }],
      },
    }),
  )
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/public",
      alwaysStatic: false,
      staticLimit: 0,
    }),
  )
  .onError(({ error, set, request, ...ctx }) => {
    let message = { en: "", ar: "", details: "", code: "" } as TSystemError;

    switch (true) {
      case error instanceof UnauthorizedError:
      case error instanceof NotFoundError:
      case error instanceof ServerError:
      case error instanceof BadRequestError:
      case error instanceof ConflictError: {
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

    // Log error to error.logs with full context
    const errorObj = error as any;
    errorLogger.error({
      error: {
        message: errorObj?.message || String(error),
        stack: errorObj?.stack,
        name: errorObj?.name,
        type: error.constructor.name,
      },
      request: {
        method: request.method,
        url: request.url,
      },
      context: customProps(ctx as any),
      timestamp: new Date().toISOString(),
      errorResponse: message,
    });

    return { success: false, data: null, errorMessage: message };
  })
  .onAfterHandle(({ request, response, ...ctx }) => {
    // Skip logging for root health check endpoint
    const url = new URL(request.url);
    const filteredUrls = ["/", "/notifications/unread-count"];
    const shouldLogRequest = !filteredUrls.includes(url.pathname);

    if (shouldLogRequest) {
      requestLogger.info({
        request: {
          method: request.method,
          url: request.url,
          pathname: url.pathname,
        },
        response: {
          status: (response as Response)?.status,
        },
        context: customProps(ctx as any),
        timestamp: new Date().toISOString(),
      });
    }

    const responseContentType =
      ((response as Response)?.headers as Headers)?.get("content-type") ?? "";

    if (!!responseContentType) {
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
      }
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
  .use(AutocompleteController)
  .use(PaymentsController)
  .use(SeedController)
  .get("/api/ping", async () => {
    return "pong";
  })
  .get("/", async () => {
    return "pong";
  });

export default app;
