const redis = require("redis");
const { promisify } = require("util");

const Url = require("../model/urlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')



const isValid = value => {
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0 ) return false
    return true
}



//Connect to redis
const redisClient = redis.createClient(
  19720,
  "redis-19720.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("13Lx8pEAxBUpdWF00PrlOAX1gvoiNCXi", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);       //it bind object so that we can be use it as a function.
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




const baseUrl = 'http:localhost:3000'



const urlShort = async (req, res) => {
  try {
    const {  longUrl} = req.body                       // destructure the longUrl from req.body.longUrl , (URL = uniform resource locator),(URI = uniform resource identifier), check base url if valid using the validUrl.isUri method
    
    if(!Object.keys(req.body).length > 0 || !isValid(longUrl))
        return res.status(400).send({status: false, message: "Please enter the URL."}) 

    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json('Invalid base URL')    // check- not authorized
  }

    if(!validUrl.isUri(longUrl.trim()))
        return res.status(400).send({status: false, message: "Enter a Valid URL."}) 

    let checkRedis = await GET_ASYNC(`${longUrl}`) 
    if( checkRedis)
        return res.status(200).send({status:true,message:"Data from Redis", redisdata:JSON.parse(checkRedis)})


    let checkDB = await Url.findOne({longUrl: longUrl}).select({_id:0, createdAt:0, updatedAt: 0, __v:0})
    if(checkDB){
        await SET_ASYNC(`${longUrl}`,JSON.stringify(checkDB));
        return res.status(200).send({status: true, message: "Data from DB and it sets this data in Redis ", data: checkDB})
        }

            const urlCode = shortid.generate().toLowerCase()
            const shortUrl = baseUrl+ '/' + urlCode
            req.body.shortUrl = shortUrl;
            req.body.urlCode = urlCode;
            let generateUrl = await Url.create(req.body)
          
            let Data = {
              urlCode : generateUrl.urlCode,
              longUrl  : generateUrl.longUrl,
              shortUrl : generateUrl.shortUrl
            }
            res.status(201).json({status : true, message : "This is generated url from DB",data: Data})//.select({_id:0, createdAt:0, updatedAt: 0, __v:0})
    }
      catch(err){
          console.log(err)
          res.status(500).end("Server Error")

      }
    }





const getUrlRedis = async function (req, res) {
    try{
        let data = req.params
        const url = await GET_ASYNC(`${req.params.urlCode}`)
        if(url) {
        res.status(302).redirect(JSON.parse(url).longUrl)        //res.status(302).redirect(findUrl)      for permanent 301
      }
        else {
        let short = await Url.findOne({urlCode: data.urlCode}) ;
        if(!short) {
          return  res.status(404).send({ status: false, message: "Urlcode Not Found" });
        }
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(short))
        res.status(302).redirect(short.longUrl)                  // status(302).redirect
      } 
   }  
    catch (err){
        console.log(err)
        res.status(500).json({status : false , err: err.message})
   }
};


module.exports = {urlShort, getUrlRedis }


