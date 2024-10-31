import { getAccessToken } from "../utils/zohoAuth";

export default async function Home() {
  try {
    const token = await getAccessToken();
    console.log("Access Token:", token);
    const response = await fetch(
      "https://www.zohoapis.in/creator/v2.1/data/demo13cloudq/trident-data-demo/report/All_Property_Details",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
        method: "GET",
        cache: "no-store",
      }
    );
    const responseBody = await response.text();

    if (!response.ok) {
      console.error("Error Response:", responseBody);
      throw new Error(
        `Failed to fetch data from Zoho: ${response.status} ${response.statusText}`
      );
    }

    const data = JSON.parse(responseBody);

    return (
      <div>
        <h1>Zoho Data</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return <div>Error: {error.message}</div>;
  }
}
