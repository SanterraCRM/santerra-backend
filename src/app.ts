import cors from "cors";
import express from "express";
import { z } from "zod";

import "./shared/container";
import { authRouter } from "./modules/auth";
import { companyRouter } from "./modules/company";
import { dashboardRouter } from "./modules/dashboard";
import { eventRouter } from "./modules/event";
import { fileRouter } from "./modules/file";
import { invitationRouter } from "./modules/invitation";
import { memberRouter } from "./modules/member";
import { productRouter } from "./modules/product";
import { manufacturerRouter } from "./modules/manufacturer";
import { personRouter } from "./modules/person";
import { harvestRouter } from "./modules/harvest"
import { permissionRouter } from "./modules/permission";
import { roleRouter } from "./modules/role";
import { resellerRouter } from "./modules/reseller";
import { potentialRouter } from "./modules/potential";
import { producerRouter } from "./modules/producer";
import { userRouter } from "./modules/user";
import { walletRouter } from "./modules/wallet";
import { employeeRouter } from "./modules/employee";
import { commercialTripRouter } from "./modules/commercialTrip";
import { commercialActionRouter } from "./modules/commercialAction";
import { groupRouter } from "./modules/group";

import { errorHandler } from "./shared/http/middlewares/error-handler";

z.config(z.locales.ptBR());

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter());
app.use("/members", memberRouter());
app.use("/invitations", invitationRouter());
app.use("/companies", companyRouter());
app.use("/products", productRouter());
app.use("/manufacturers", manufacturerRouter());
app.use("/persons", personRouter());
app.use("/harvests", harvestRouter());
app.use("/permissions", permissionRouter());
app.use("/roles", roleRouter());
app.use("/resellers", resellerRouter());
app.use("/potentials", potentialRouter());
app.use("/users", userRouter());
app.use("/wallets", walletRouter());
app.use("/employees", employeeRouter());
app.use("/files", fileRouter());
app.use("/producers", producerRouter());
app.use("/events", eventRouter());
app.use("/commercial-trips", commercialTripRouter());
app.use("/commercial-actions", commercialActionRouter());
app.use("/groups", groupRouter());
app.use("/dashboard", dashboardRouter());

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Rota não encontrada.",
    },
  });
});

app.use(errorHandler);
