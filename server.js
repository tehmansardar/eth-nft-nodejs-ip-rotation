require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const cookieParser = require("cookie-parser");
// const HttpsProxyAgent = require("https-proxy-agent");
const { getProxyHttpAgent } = require("proxy-http-agent");

const ip = require("./ip.js");

const { TOKEN } = process.env;

// middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// DB config

// Methods
const response = fetch(
  "https://apparent.tools/wp-json/api/v1/get-all-enrolled-nft",
  {
    headers: {
      method: "GET",
      "Content-Type": "application/json",
      Authorization: TOKEN,
    },
  }
)
  .then((response) => response.json())
  .then((data) => {
    // opensea Event fetching
    console.log(data.data[0].token_id);
    const eventData = [];
    const event_type = [
      "bid_entered",
      "bid_withdrawn",
      "successful",
      "created",
    ];
    // const proxyAgent = new HttpsProxyAgent("http://143.244.139.84:3128");
    // let agent = getProxyHttpAgent({
    //   // proxy: "http://165.225.8.87:10605",
    //   proxy: ip[8],
    //   rejectUnauthorized: false,
    // });
    for (let h = 0; h < data.data.length; h++) {
      let agent = getProxyHttpAgent({
        // proxy: "http://165.225.8.87:10605",
        proxy: ip[5],
        rejectUnauthorized: false,
      });
      for (let i = 0; i < event_type.length; i++) {
        // setTimeout(function () {
        const openseaData = fetch(
          `https://api.opensea.io/api/v1/events?asset_contract_address=${data.data[h].collection_address}&token_id=${data.data[h].token_id}&event_type=${event_type[i]}&only_opensea=false&occurred_after=2018-01-23T04:51:38.832339`,
          {
            method: "GET",
            agent: agent,
            headers: {
              connection: "Close",
            },
          }
        );
        openseaData
          .then((res) => res.json())
          .then((d) => {
            eventData.push({
              token_id: data.data[h].token_id,
              asset_events: d.asset_events,
            });
            console.log(eventData);
          })
          .catch((e) => console.log(e));
        openseaData.end;
        // }, 1000);
      }
    }

    // End Event fetching
    // console.log(eventData);
  })
  .catch((err) => console.log(err));

// Routes

app.use("/", (req, res, next) => {
  res.json({ msg: "Hello everyone" });
});

// PORT
const PORT = process.env.PORT || 3000;

// Listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
