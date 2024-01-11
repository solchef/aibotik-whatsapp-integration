import axios from "axios";
import { Request, Response, NextFunction } from 'express';
import { API_URL, TOKEN, VERIFY_TOKEN } from "../constants";
require("dotenv").config();

async function checkContact(mobileNumber: string) {
  let obj = {
    blocking: "wait",
    contacts: [mobileNumber],
    force_check: true,
  };
  let x: any = await axios.post(`${API_URL}/v17.0/contacts`, obj, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return x.data;
}


async function sendMessage(req: Request, res: Response) {
  const requestBody = {
    messaging_product: 'whatsapp',
    to: '971568625603',
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US'
      }
    }
  };

  try {
    const response = await axios.post(API_URL, requestBody, {
      'headers': {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle the response as needed
    console.log('Response:', response.data);
    // res.status(200).json(response.data);
  } catch (error:any) {
    // Handle errors
    console.error('Error:', error.message);
    // res.status(500).send('Internal Server Error');
  }
};

// Accepts POST requests at /webhook endpoint
interface WebhookData {
  object?: string;
  entry?: {
    changes?: {
      value?: {
        metadata: {
          phone_number_id: string;
        };
        messages?: {
          from: string;
          text: {
            body: string;
          };
        }[];
      };
    }[];
  }[];
}

async function webhookPost(req: Request, res: Response): Promise<void> {
  // Parse the request body from the POST
  const data: WebhookData = req.body!; // Using non-null assertion

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (data.object) {
    if (
      data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    ) {
      const phone_number_id: string =
        data.entry[0].changes[0].value.metadata.phone_number_id;
      const from: string = data.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      const msg_body: string = data.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

      try {
        await axios.post(
          `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${TOKEN}`,
          {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: `Ack: ${msg_body}` },
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error:any) {
        console.error('Error sending response:', error.message);
      }
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if the event is not from a WhatsApp API
    res.sendStatus(404);
  }
}



// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
interface WebhookQuery {
  mode: string;
  verify_token: string;
  challenge: string;
}

async function webHookGet(req: Request, res: Response): Promise<void> {
  /**
   * UPDATE YOUR VERIFY TOKEN
   * This will be the Verify Token value when you set up the webhook
   **/

  // Parse params from the webhook verification request
  let info =req.query;

  let mode = info['hub.mode'];
  let token = info["hub.verify_token"];
  let challenge = info["hub.challenge"];


  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.sendStatus(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
}


export {
    checkContact, sendMessage, webhookPost, webHookGet
}


// async function main() {
//   let mobileNumber: string = "+971568625603";
//   let mobileStatus = await checkContact(mobileNumber);
//   if (mobileStatus.contacts[0].status === "valid") {
//     let whatsAppID = mobileStatus.contacts[0].wa_id;
//     let msgSentStatus = await sendMessage(whatsAppID, "name", "123");
//     // console.log(msgSentStatus);
//     if (msgSentStatus.errors !== undefined) {
//       console.log("----------------------");
//       console.log(`Error for ${whatsAppID}`);
//       console.log(`${msgSentStatus.errors[0].title}`);
//       console.log(`${msgSentStatus.errors[0].details}`);
//       console.log("----------------------");
//     }
//     let messageId: string = msgSentStatus.messages[0].id;
//     console.log(`message sent with message id ${messageId} `);
//   } else {
//     console.log(`can't verify the ${mobileNumber}`);
//   }
// }

// main();
