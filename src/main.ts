import { Connection } from "./connection.ts";
import { IceMode } from "./signaling.ts";

function initialize() {
    const connection = new Connection("", IceMode.VanillaIce);

    // Offerとして接続ボタン
    const connectOfferButton = document.getElementById("connect-offer-button");
    if (connectOfferButton) {
        connectOfferButton.onclick = async () => {
            const offerSdp = await connection.connectAsOffer();
            await navigator.clipboard.writeText(offerSdp);
            console.log("offer sdp copied")
        };
    }

    // Answerとして接続ボタン
    const connectAnswerButton = document.getElementById("connect-answer-button");
    if (connectAnswerButton) {
        connectAnswerButton.onclick = async () => {
            const offerSdp = await navigator.clipboard.readText();
            const answerSdp = await connection.connectAsAnswer(offerSdp);
            await navigator.clipboard.writeText(answerSdp);
            console.log("answer sdp copied");
        };
    }

    // Answerを登録ボタン
    const setAnswerButton = document.getElementById("set-remote-answer-button");
    if (setAnswerButton) {
        setAnswerButton.onclick = async () => {
            const answerSdp = await navigator.clipboard.readText();
            await connection.setRemoteAnswer(answerSdp);
        };
    }

    // テストメッセージボタン
    const sendTestMessageButton = document.getElementById("send-text-button");
    if (sendTestMessageButton) {
        sendTestMessageButton.onclick = () => {
            connection.sendApplicationDataChannel("Test");
        };
    }
}

initialize();
