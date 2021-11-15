'use strict';

module.exports = {
   Bearer: validateToken //'Bearer' same as defined in swagger.yaml
};

let helper = require('./utils');

function validateToken(req, res, next) {

   let prefix = 'Bearer ';
   if (req.headers.authorization && req.headers.authorization.startsWith(prefix))
   {
      let token = req.headers.authorization.substr(prefix.length);

      try
      {
         helper.validateToken(token,function (data) {
            if(data["error"])
            {
               next( new Error(data["error"]) );//403
            }
            else
            {
               req.decodedToken = data.token;
               next(null,data);
            }
         });
      }
      catch (e)
      {
         e.statusCode=401;
         next(e);
      }
   }
   else
   {
      // next({error: 'Required token missing!', statusCode: 400});//
      let e = new Error('Required security/JWT token missing!');
      e.statusCode=400;
      next(e);

   }

}