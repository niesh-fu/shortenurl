const Url = require("../model/urlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')




const isValid = value => {
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0 ) return false
    return true
}


const redis = require("redis");

const { promisify } = require("util");

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

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);   //it bind object so that we can be use it as a function.
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




const baseUrl = 'http:localhost:3000'

const urlShort = async (req, res) => {
    const {  longUrl} = req.body                       // destructure the longUrl from req.body.longUrl , (URL = uniform resource locator),(URI = uniform resource identifier), check base url if valid using the validUrl.isUri method
    
    if(!Object.keys(req.body).length || !isValid(longUrl))
    return res.status(400).send({status: false, message: "Please enter the URL."}) 

    if(!validUrl.isUri(longUrl.trim()))
    return res.status(400).send({status: false, message: "Enter a Valid URL."})

//    const regex = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;
//    if(!regex.test(longUrl)) return res.status(400).json({ status : false, message : "Enter a valid url in reqBody"})



    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json('Invalid base URL')
    }
    const urlCode = shortid.generate()//.toLowerCase()              // if valid, we create the url code,,  used to create short non-sequential url-friendly unique ids.,It Can generate any number of ids without duplication.

    if (validUrl.isUri(longUrl.trim())) {                       // check long url if valid using the (validUrl.isUri method) => isUri(value) accepts value as string to be checked as any protocol url ,returns undefined if is not url,
       
        try {
            let url = await Url.findOne({ longUrl :  longUrl })
             if (url) { res.json(url)}                          // url exist and return the respose
         else {
               const shortUrl = baseUrl + '/' + urlCode         // join the generated short code the the base url
                 url = new Url({ longUrl,shortUrl,urlCode })              // invoking the Url model and saving to the DB                           //date: new Date() ,urlCode 
                 await url.save()                                 // saving the url in DB
                res.json(url)
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).json('Server Error')
        }
    } else {
        res.status(401).json('Invalid longUrl')
    }
}




// const getUrl =  async(req, res)=>{
//     try{
//         const url = await Url.findOne({urlCode: req.params.urlCode})
//         if(url){
//             return res.redirect(url.longUrl)
//         }
//         else{
//             return res.status(404).json('No URL Found')
//         }

//     }
//     catch(err){
//         console.error(err)
//         res.status(500).json('Server Error')
//     }
// }



const getUrlRedis = async function (req, res) {
    try{
        let data = req.params
    const url = await GET_ASYNC(`${req.params.urlCode}`)
    console.log(typeof (url))

    if(url) {
      res.redirect(JSON.parse(url).longUrl)        //res.status(302).redirect(findUrl)      for permanent 301
      
    // res.redirect(url.longUrl)
    } else {
      let short = await Url.findOne({urlCode: data.urlCode}) ;
      if(!short) {
            return  res.status(404).send({ status: false, message: "Urlcode Not Found" });
            }
      
      await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(short))
      res.redirect(short.longUrl)      // status(302).redirect
    } 
}  catch (err){
    console.log(err)
    res.status(500).json({status : false , err: err.message})
}
  
  };


module.exports = {urlShort, getUrlRedis }




// const reDirectUrl=async (req,res) =>{
//     try{
// let urlCode= req.params.urlCode
//  let findUrl=await GET_ASYNC(`${urlCode}`)

// if(findUrl){
 
// res.send({findUrl})
//   //res.status(302).redirect(findUrl)
// }
// else {
// let getUrlCode=await urlModel.findById({urlCode:urlCode})
// if(!getUrlCode) {
// return  res.status(404).send({ status: false, message: "Urlcode Not Found" });
// }

//   //  SETTING : url data in cache
//   await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrlCode))
  
// return res.status(302).redirect(getUrlCode.longUrl);
// }}
// catch (err) {
//     res.status(500).send({ status: false, message: err.message });
//   }
// }