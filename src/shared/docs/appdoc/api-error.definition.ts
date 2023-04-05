

/**
 * @apiDefine apiError
 * @apiError  (Error 5xx) 500-InternalServerError  Internal Server Error
 * @apiUse apiInternalErrorExample
 */

/**
 * @apiDefine apiBadRequestExampleUser
 * @apiExample {json} Bad Request (Example) 
 * * HTTP/1.1 400 Bad Request
 * {
 *  statusCode: 400
 *  error: "Bad Request",
 *  message:[ "firstName should not be empty"  ]
 * }
 */

/**
 * @apiDefine apiBadRequestExampleResetPassword
 * @apiExample {json} Bad Request (Example) 
 * * HTTP/1.1 400 Bad Request
 * {
 *  statusCode: 400
 *  error: "Bad Request",
 *  message:[ "password should not be empty"  ]
 * }
 * 
 */

/**
 * @apiDefine apiBadRequestExampleEmailResetPassword
 * @apiExample {json} Bad Request (Example) 
 * * HTTP/1.1 400 Bad Request
 * {
 *  statusCode: 400
 *  error: "Bad Request",
 *  message:[ "email should not be empty"  ]
 * }
 * 
 */

/**
 * @apiDefine apiLoginOrPasswordIncorrectExampleUser
 * @apiExample {json} Login Error (Example) 
 * * HTTP/1.1 401 Unauthorized
 * {
 *  statusCode: 401
 *  error: "Authentification error",
 *  message:[ "Email/password incorrect"  ]
 * }
 */


/**
 * @apiDefine apiInternalErrorExample
 * @apiExample {json} Internal Server Error (Response):
 * HTTP/1.1 500 Internal Error
 * {
 *  statusCode: 500
 *  message: "Internal Error"
 * }
 */