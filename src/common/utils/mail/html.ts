export const template = (
  code: string,
  name: string,
  subject: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      /* Background Colors: --bg-main: 11 31 23 */
      background-color: rgb(11, 31, 23);
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      /* Background Colors: --bg-card: 18 46 36 */
      background-color: rgb(18, 46, 36);
      /* Border Colors: --border-default: 30 74 58 */
      border: 1px solid rgb(30, 74, 58);
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      /* Primary Colors: --primary: 27 201 111 */
      background-color: rgb(27, 201, 111);
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
    }
    .email-body {
      padding: 20px;
      /* Text Colors: --text-secondary: 182 216 200 */
      color: rgb(182, 216, 200);
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
    }
    .code-box {
      display: inline-block;
      /* Background Colors: --bg-secondary: 15 42 32 */
      background-color: rgb(15, 42, 32);
      /* Primary Colors: --primary: 27 201 111 */
      color: rgb(27, 201, 111);
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 20px 0;
      /* Primary Colors: --primary: 27 201 111 */
      border: 1px dashed rgb(27, 201, 111);
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      /* Background Colors: --bg-secondary: 15 42 32 */
      background-color: rgb(15, 42, 32);
      font-size: 13px;
      /* Text Colors: --text-muted: 127 168 154 */
      color: rgb(127, 168, 154);
    }
    .email-footer a {
      /* Primary Colors: --primary: 27 201 111 */
      color: rgb(27, 201, 111);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>

    <div class="email-body">
      <h2>Hello ${name},</h2>

      <p>
        Thank you for joining <strong>Bassant ElQenawy Educational Platform</strong>.
        To proceed with <strong>${subject.toLowerCase()}</strong>, please use the verification code below:
      </p>

      <div class="code-box">${code}</div>

      <p>
        This code is valid for a limited time.
        If you did not request this action, please ignore this email.
      </p>

      <p>
        Best regards,<br />
        <strong>Bassant ElQenawy Platform Team</strong>
      </p>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Bassant ElQenawy Educational Platform</p>
      <p>
        <a href="[SupportLink]">Contact Support</a> |
        <a href="[UnsubscribeLink]">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;


  export const subscriptionApprovedHtml = (
  name: string,
  subject: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      /* Background Colors: --bg-main: 11 31 23 */
      background-color: rgb(11, 31, 23);
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      /* Background Colors: --bg-card: 18 46 36 */
      background-color: rgb(18, 46, 36);
      /* Border Colors: --border-default: 30 74 58 */
      border: 1px solid rgb(30, 74, 58);
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      /* Primary Colors: --primary: 27 201 111 */
      background-color: rgb(27, 201, 111);
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
    }
    .email-body {
      padding: 20px;
      /* Text Colors: --text-secondary: 182 216 200 */
      color: rgb(182, 216, 200);
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      /* Background Colors: --bg-secondary: 15 42 32 */
      background-color: rgb(15, 42, 32);
      font-size: 13px;
      /* Text Colors: --text-muted: 127 168 154 */
      color: rgb(127, 168, 154);
    }
    .email-footer a {
      /* Primary Colors: --primary: 27 201 111 */
      color: rgb(27, 201, 111);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>

    <div class="email-body">
      <h2>Hello ${name},</h2>

      <p>
        We are excited to inform you that your subscription to <strong>${subject.toLowerCase()}</strong> has been approved!
      </p>

      <p>
        You now have full access to all the features and content included in your subscription.
      </p>

      <p>
        Start learning and enjoy your educational journey with <strong>Bassant ElQenawy Educational Platform</strong>.
      </p>

      <p>
        Best regards,<br />
        <strong>Bassant ElQenawy Platform Team</strong>
      </p>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Bassant ElQenawy Educational Platform</p>
      <p>
        <a href="[SupportLink]">Contact Support</a> |
        <a href="[UnsubscribeLink]">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;


export const subscriptionRejectedHtml = (
  name: string,
  subject: string,
  reason: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      /* Background Colors: --bg-main: 11 31 23 */
      background-color: rgb(11, 31, 23);
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      /* Background Colors: --bg-card: 18 46 36 */
      background-color: rgb(18, 46, 36);
      /* Border Colors: --border-default: 30 74 58 */
      border: 1px solid rgb(30, 74, 58);
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      /* Primary Colors: --primary: 27 201 111 */
      background-color: rgb(27, 201, 111);
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
    }
    .email-body {
      padding: 20px;
      /* Text Colors: --text-secondary: 182 216 200 */
      color: rgb(182, 216, 200);
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      /* Text Colors: --text-primary: 255 255 255 */
      color: rgb(255, 255, 255);
    }
    .reason-box {
      display: inline-block;
      /* Background Colors: --bg-secondary: 15 42 32 */
      background-color: rgb(15, 42, 32);
      /* Text Colors: --text-secondary: 182 216 200 */
      color: rgb(182, 216, 200);
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      margin: 20px 0;
      /* Border Colors: --border-default: 30 74 58 */
      border: 1px dashed rgb(30, 74, 58);
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      /* Background Colors: --bg-secondary: 15 42 32 */
      background-color: rgb(15, 42, 32);
      font-size: 13px;
      /* Text Colors: --text-muted: 127 168 154 */
      color: rgb(127, 168, 154);
    }
    .email-footer a {
      /* Primary Colors: --primary: 27 201 111 */
      color: rgb(27, 201, 111);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div> 
    <div class="email-body">
      <h2>Hello ${name},</h2>

      <p>
        We regret to inform you that your subscription request for
        <strong>${subject.toLowerCase()}</strong> on <strong>Bassant ElQenawy Educational Platform</strong> has been rejected.
      </p>

      <p>
        <strong>Reason:</strong>
      </p>

      <div class="reason-box">${reason}</div>

      <p>
        Our team will review your request and get back to you as soon as possible.
      </p>

      <p>
        Best regards,<br />
        <strong>Bassant ElQenawy Platform Team</strong>
      </p>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Bassant ElQenawy Educational Platform</p>
      <p>
        <a href="[SupportLink]">Contact Support</a> | 
        <a href="[UnsubscribeLink]">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;


