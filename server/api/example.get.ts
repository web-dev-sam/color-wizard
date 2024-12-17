import { Time } from "../utils/defaults"
import { createRateLimit, rateLimit } from "../utils/rate-limit"

// TODO: Use redirects to show the user a message that their email has been verified
export default defineEventHandler(async (event) => {
  rateLimit(event, {
    key: "email-verification",
    limits: [
      createRateLimit(5, Time.Minute),
      createRateLimit(10, Time.Hour),
    ],
  })

  return "You got exampled!"
})
