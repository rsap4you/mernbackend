exports.sendOtp = async(result) => {
    const template = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>OTP</title>
    </head>
    <body>
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                      <img src="" style="width: 80px;">
                </div>
                <p style="font-size:1.1em">Hello ${result.role},</p>
                <p>Thank you for choosing <b>${process.env.APP_NAME}</b>. Use the following OTP to complete your Sign Up procedures.</p>
                <h2 style="background: #8ec63f;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${result.otp}</h2>
                <p style="font-size:0.9em;">Regards,<br /><b>${process.env.APP_NAME}</b></p>
                <hr style="border:none;border-top:1px solid #eee" />
              </div>
        </div>
    </body>
    </html>`;
    return template;
}

exports.forgetPasswordTemplate = async (result) => {
	const template = `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>OTP</title>
	</head>
	<body>
		<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
			  <div style="margin:50px auto;width:70%;padding:20px 0">
				<div style="border-bottom:1px solid #eee">
					  <img src="" style="width: 80px;">
				</div>
				<p style="font-size:1.1em">Hello User,</p>
				<p>Thank you for choosing <b>${process.env.APP_NAME}</b>. Use the following OTP for forgot password procedure. </p>
				<h2 style="background: #8ec63f;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${result.otp}</h2>
				<p style="font-size:0.9em;">Regards,<br /><b>${process.env.APP_NAME}</b></p>
				<hr style="border:none;border-top:1px solid #eee" />
			  </div>
		</div>
	</body>
	</html>`;
	return template
  };