'use strict';

module.exports = {validateToken,handleResponse};

/*
  Functions to validate token

  Param 1: token in  header; 'Authorization:Bearer token'
  Param 2: JWKS or JWKS_URI in environment variables

  return:
   decoded token or
   throws Error
 */
function validateToken(token,cb)
{
   if(!token)
   {
      throw new Error('Required input, Authorization token missing!');
   }

   if( !process.env.JWKS_URI && !process.env.JWKS )
   {
      let error = 'To decode token, required public key information (JWKS | JWKS_URI) missing!';
      throw new Error(error);
   }

   // let tokenEpired = 'eyJraWQiOiJKT1d6WXVta2I1bm9nRE1OSTBZSmtTUU40M0RqUGZoZ01YZjVuMGMwbHNZPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiUE42YlV3M09ldHA2T1NXTTRzQjItZyIsInN1YiI6IjY5ZjA3N2Y4LTg5MzAtNDAyNC05ZGY4LWZlZWIyNTIxOGU5YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl96ejR3TXByRFgiLCJjb2duaXRvOnVzZXJuYW1lIjoiNjlmMDc3ZjgtODkzMC00MDI0LTlkZjgtZmVlYjI1MjE4ZTliIiwiYXVkIjoiaGdwYnIzNGw0cmJkcmduMmZkc2dodWEzYiIsImV2ZW50X2lkIjoiZjljNTIwMDEtZDA0Ny00N2ZlLWIyN2UtNWJhMWE5YWE1ZTNhIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTU5ODE0OTMsIm5hbWUiOiJNIE11amVlYiBBc2lmIiwiZXhwIjoxNjE1OTg1MDkzLCJpYXQiOjE2MTU5ODE0OTQsImVtYWlsIjoicGl4YWtvLm11amVlYkBnbWFpbC5jb20ifQ.fd4OsEvOqY9F57VPVQawnPU1gKynv8AY6llr992K_p0dmOzEsAn7RYuAaxe81VDYNmmgk6dnr_z-MpA7o7H6zGaqw0B_DXeB8kR8_gTwFPN1v8voqc4WOutGrP-q4fO0W9Y3Q9E0MqSIYyaRq8WmZw89_W6C2fn0WLsXuCgNDWOBDG4nSX1WGKCh9MRnQ0iRaapaV29bTKgvF56S9zlHL0lEWB8mtxvx6tyU8WwyxsoBp79ZEm_d_JSY-T2GQz2v1z3Bq4k4Txv4skwxWYw-wq1HtFR45l2-6mE9vhXdciJJiluhVPCKipIr5FiG3_Iumj41rUshaldbqmyYBwNueA';

   let response = [];

   //trim subsequent/2nd param(s) (if any) e.g. &access_token
   token = token.split('&')[0];

   //trim prefix 'Bearer'
   let prefix = "Bearer ";
   if (token.indexOf(prefix) == 0) token = token.slice(prefix.length);


   let jwt = require('jsonwebtoken');
   let jwks = '';

   //with public key in hand
   if(process.env.JWKS)
   {
      //load JWKS
      try
      {
         jwks = JSON.parse(process.env.JWKS);
      }
      catch (err)
      {
         throw new Error('Invalid public key information! Error while parsing/decoding jwks');
      }

      //decode token.
      let buff = Buffer.from(token.split('.')[0], 'base64');// format: header.payload.signature base64_encoded
      let tokenHead = buff.toString('ascii');

      try
      {
         tokenHead = JSON.parse(tokenHead);
      }
      catch (err)
      {
         throw new Error('Invalid token! Error while parsing/decoding token');
      }

      //find relevant jwk.
      let idx = -1;
      if( jwks['keys'] )
      {
         idx = jwks.keys.findIndex(function (v) {
            return v.kid === tokenHead.kid
         });
      }

      if(idx==-1)
      {
         throw new Error('Public key to decode mentioned token not found!');
      }

      let jwk = jwks.keys[idx];

      let jwkToPem = require('jwk-to-pem');
      let pem = jwkToPem(jwk); //https://www.npmjs.com/package/jwk-to-pem

      let tokenPayLoad = '';
      jwt.verify(token, pem, {algorithms: ['RS256']}, function (err, decodedToken) {
         let data = {"error": err, "token": decodedToken};
         if (err)
         {
            throw new Error(err);
         }
         if (decodedToken) tokenPayLoad= decodedToken;
         if(typeof cb !="undefined")cb(data);
      });

      console.log('token verified successfully with available JWKS');
      // return tokenPayLoad;
   }
   else if(process.env.JWKS_URI)// with missing public key but uri
   {
      let jwksClient = require('jwks-rsa');

      let client = jwksClient({
         cache: true, // Default=true
         cacheMaxEntries: 5, // Default=5
         cacheMaxAge: 600000, // Default=10m
         jwksUri: process.env.JWKS_URI
      });

      let getKey = function (header, callback) {
         client.getSigningKey(header.kid, function (err, key) {
            let signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
         });
      };

      let tokenPayLoad = '';

      jwt.verify(token, getKey, {algorithms: ['RS256']} , function(err, decodedToken) {

         let data = {"error": err, "token": decodedToken};

         if(typeof cb !="undefined")
         {
            cb(data);
            return;
         }

      });

      console.log('token will be verified soon with available JWKS_URL')
   }

}



/*
* ensuring common response
* param 1: res : response object
* param 2: error
* */
function handleResponse(res,errMsg,status)
{
   if(typeof status == "undefined") status = 400;

   res.status(status);
   res.json(errMsg);

   return;
}


