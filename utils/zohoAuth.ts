// utils/zohoAuth.ts

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const tokenPath = path.join(process.cwd(), "tokens.json");

const client_id = process.env.CLIENT_ID as string;
const client_secret = process.env.CLIENT_SECRET as string;

const token_url = "https://accounts.zoho.in/oauth/v2/token";

interface Tokens {
  refresh_token: string;
  access_token: string;
  expires_in: number;
  obtained_at: number;
}

interface ZohoTokenResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export async function getAccessToken(): Promise<string> {
  let tokens: Tokens;

  if (fs.existsSync(tokenPath)) {
    tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8")) as Tokens;
  } else {
    throw new Error("Tokens not found. Please authorize first.");
  }

  const { access_token, refresh_token, expires_in, obtained_at } = tokens;

  const now = Date.now();

  // Check if the access token is expired
  if (now > obtained_at + expires_in * 1000) {
    // Access token is expired, refresh it
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("refresh_token", refresh_token);

    try {
      const response = await fetch(token_url, {
        method: "POST",
        body: params,
      });
      const data = (await response.json()) as ZohoTokenResponse & {
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      } else {
        const newAccessToken = data.access_token;
        const newExpiresIn = data.expires_in;

        // Update tokens
        tokens.access_token = newAccessToken;
        tokens.expires_in = newExpiresIn;
        tokens.obtained_at = now;

        // Save updated tokens
        fs.writeFileSync(tokenPath, JSON.stringify(tokens));

        return newAccessToken;
      }
    } catch (error) {
      throw new Error(
        "Failed to refresh access token: " + (error as Error).message
      );
    }
  } else {
    return access_token;
  }
}
