import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

const audience = process.env.AUDIENCE;
const issuerBaseURL = process.env.ISSUER_BASE_URL;

export const jwtCheck = auth({
  audience: audience,
  issuerBaseURL: issuerBaseURL,
  tokenSigningAlg: "RS256",
});
