#PASSWORD RESET FLOW - BACKEND


  1. The backend uses Node.js with Express to create an API for handling password reset requests.

  2. Upon receiving a password reset request (POST /api/auth/forgot-password), the server:

  3. Verifies if the provided email exists in the database.

  4. Generates a secure random token (using libraries like crypto or uuid).

  5. Saves the token and its expiry time to the user's record in the database (MongoDB).

  6. Sends a reset email using a service like NodeMailer, with a link containing the reset token.

  7. The token is checked for validity and expiration when the user accesses the reset link.

  8. The password update endpoint allows users to submit a new password after validating the token.

     
