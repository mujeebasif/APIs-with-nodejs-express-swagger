###### Prerequisite 
- Node 
- npm 


###### Getting Started 

**Quick start?**
	clone/download folder test-apis to start quickly
	
- `npm install` (first time only) 
- `npm update` (to update dependencies)
- `node app.js` (for deployment) 
	

**Start from scratch?**
	to start from scratch follow following steps:

- via terminal execute `npm install -g swagger` to install swagger globally
- execute `swagger project create test-apis` & from availabe options select 'express' . 
- executing above, will create folder test-apis, with initial template to get started.
- open (cd) newly created folder 'test-apis' in terminal/cmd
- execute `swagger project start`
- if u get error 
	"Error initializing middleware
	 Error: Cannot find module 'test-apis\api\fittings\swagger_router' "
	to fix it
-	a) open package.json, Update your swagger-express-mw version to	"swagger-express-mw": "^0.7.0"
-	b) in config/default.yaml Add '- swagger_params_parser' under heading 'swagger_controllers' after '- cors '
-	c) execute `npm install`

- after fixing error start project again.
- upon successful start, now call url: http://127.0.0.1:10010/hello?name=world to get response hello world.	
- controller/logic of hello api available at api/controllers/hello_world.js
- execute `swagger project edit` to open swagger editor for api spec modification
- at line 23 of api/swagger/swagger.yaml i.e. 'x-swagger-router-controller: hello_world' here 'hello_world' is name of api/controllers/hello_world.js
- & in 'operationId: hello' hello represent name of function needs to be called from said file upon get request. 
- for more [checkou swagger spec](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

###### Swagger UI

- `npm install swagger-ui-dist --save`
- update `app.js` to replace line `var app = require('express')();` with `var express = require('express'); var app = express();` 
- update app.js to add line `require('./swagger-ui-router.js')(app,express);` before `app.listen(port);`
- file `swagger-ui-router.js` can be taken from folder test-apis & placed at root of folder
- restart project
- swagger-ui can be seen at root i.e. `http://localhost:10010/`

###### Security Handler

- update _api/swagger/swagger.yaml_ ; to apply security to all paths add following before `paths:`
```
securityDefinitions:
  Bearer:
    type: oauth2
    authorizationUrl: https://xyz.auth.us-east-2.amazoncognito.com/login     
    flow: implicit 
security: 
  - Bearer: []
```

- update `authorizationUrl` in above snippet accordingly 
- update `config/default.yaml` & replace `- swagger_security` with `- _swagger_security`
- before heading `swagger_controllers:` add following code
```
_swagger_security:
  name: swagger_security
  securityHandlersModule: api/helpers/securityHandlers  # <= This is the relative path to your javascript module
```

- take copy of `api/helpers/securityHandlers.js` & `api/helpers/utils.js` from folder `test-apis`
- `npm install jsonwebtoken jwk-to-pem jwks-rsa dotenv --save`
- add `require('dotenv').config();` in `app.js`
- create file `.env` at root & define expected `JWKS` or `JWKS_URI` i.e. public keys or public keys uri/url. required to decode JWT
	
###### Important Links
- https://github.com/swagger-api/swagger-node
- _Example:_  https://editor.swagger.io/#/
- _Specifications:_ https://swagger.io/docs/specification/2-0/what-is-swagger/
- _Flow:_   swagger-node(swagger project start) 
  -> swagger-express-mw (wrapper on node-runner) 
  -> swagger-node-runner (e.g. Oauth being handled by it. node_modules/swagger-node-runner/fittings/swagger_security.js)
  -> sway (swagger-tool replaced with sway)
  
###### Common Dev Commands 
- `npm install -g swagger` (first time only)
- `swagger project start` 
- `swagger project edit` (design mode)
- `swagger project start -m` (mockup mode)
- set `DEBUG=swagger:*` or specifically `DEBUG=swagger:swagger_security` in .env for debug mode
- IDE PHPStorm also support [interactive debugging](https://www.jetbrains.com/help/phpstorm/running-and-debugging-node-js.html#running) of NodeJs app
 
