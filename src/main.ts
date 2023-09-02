import { Connection } from "./connection.ts";
import { IceMode } from "./signaling.ts";
import { SendMediaChannel } from "./media-channel.ts";

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

    // カメラ有効化ボタン
    const enableCameraButton = document.getElementById("enable-camera-button");
    if (enableCameraButton) {
        enableCameraButton.onclick = async () => {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const localVideoElem = document.getElementById("local-video") as HTMLVideoElement;
            localVideoElem.srcObject = mediaStream;
            localVideoElem.muted = true;
            localVideoElem.ondurationchange = () => {
                localVideoElem.play();
            };

            const sendMediaChannel = new SendMediaChannel(mediaStream, true);
            connection.addSendMediaChannel("camera", sendMediaChannel);
        };
    }

    // テストメッセージボタン
    const sendTestMessageButton = document.getElementById("send-text-button");
    if (sendTestMessageButton) {
        sendTestMessageButton.onclick = () => {
            connection.sendApplicationDataChannel("Test");
        };
    }

    // 切断処理
    window.onbeforeunload = () => {
        connection.closeConnection();
    };
}

initialize();
