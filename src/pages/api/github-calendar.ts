import type { APIRoute } from "astro";

const GITHUB_API = "https://api.github.com/graphql";
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

export const GET: APIRoute = async () => {
  const username = "lilamaris";

  const query = `
    query($userName: String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                color
                contributionCount
                date
              }
            }
          }
        }
      }
    }`;

  const res = await fetch(GITHUB_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { userName: username } }),
  });

  const data = await res.json();
  return new Response(
    JSON.stringify(data.data.user.contributionsCollection.contributionCalendar),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
