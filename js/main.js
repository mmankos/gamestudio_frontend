import * as sessionAuth from "./modules/sessionAuth";
import * as ui from "./modules/ui";




// Example usage: set the session cookie if it doesn't exist
const sessionId = sessionAuth.getSessionId();
if (!sessionId) {
	const newSessionId = sessionAuth.generateSessionId();
	sessionAuth.setSessionCookie(newSessionId);
}


console.log(sessionId);



ui.init();


