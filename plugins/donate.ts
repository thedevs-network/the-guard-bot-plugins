// Author: poeti8
// Description:
//   Add crypto donations

/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as ms from "millisecond";
import { ExtendedContext } from "../typings/context";
const { fetch } = require('undici');

const config = require("../config");
const {
  findDonation,
  addDonation,
  getDonations,
  updateDonation,
} = require("../stores/donation");

const TX_API_URL = "https://api.blockcypher.com/v1/btc/main/txs/";
const EXCHANGE_RATES_API_URL = "https://blockchain.info/ticker";


// Use count to iterate throught list of wallets and send a different one every time
let count = 0;

// Loop throught unconfirmed transactions and update the confirmation status
setInterval(() => {
  getDonations({ confirmed: false })
    .then((donations) => {
      donations.forEach(async (donation) => {
        const transaction = await fetch(TX_API_URL + donation.tx).then((res) =>
          res.json()
        );
        updateDonation({
          tx: donation.tx,
          confirmed: transaction.confirmations > 0,
        });
      });
    })
    .catch((e) => e);
}, ms("1m"));

export = async (ctx: ExtendedContext, next: () => Promise<void>) => {
  if (!ctx.update.message || !ctx.update.message.text) return next();
  const [command, tx] = ctx.update.message?.text.split(" ");
  const totalWallets = config.donate?.wallets?.length;
  if (command !== "/donate") return next();
  if (!totalWallets) return next();

  if (tx) {
    const currentDonation = await findDonation({ tx });

    if (currentDonation) {
      return ctx.reply("✅ Transaction is already submitted.");
    }

    const transaction = await fetch(TX_API_URL + tx).then((res) => res.json());
    if (transaction?.error) {
      return ctx.reply("❌ Invalid transaction.");
    }

    const output = transaction.outputs.find((o) =>
      config.donate.wallets.includes(o.addresses[0])
    );
    if (!output) {
      return ctx.reply("❌ Invalid transaction.");
    }

    const rates = await fetch(EXCHANGE_RATES_API_URL).then((res) => res.json());
    const btc = output.value / 100000000;
    const usd = (btc * rates.USD.last).toFixed(2);

    await addDonation({
      tx,
      confirmed: false,
      user_id: ctx.from?.id,
      btc,
      usd,
    });

    await ctx.replyWithHTML(
      `🤝 Thank you for your donation. You have donated ${btc} BTC <b>($${usd})</b>.`
    );
    await ctx.telegram.sendMessage(
      config.master,
      `🤝 <a href="tg://user?id=${ctx.from?.id}">${ctx.from?.first_name}</a> has donated ${btc} BTC <b>($${usd})</b>.`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.replyWithHTML(
      "⚡ You can donate to our Bitcoin wallet:\n\n" +
      `<code>${config.donate.wallets[count]}</code>\n\n` +
      "⬇ Submit your transaction via:\n\n" +
      "<code>/donate tx</code>"
    );

    count = count === totalWallets - 1 ? 0 : count + 1;
  }
};
